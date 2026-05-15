import { Router, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { protect, AuthRequest } from '../middleware/auth';
import Resume from '../models/Resume';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

// POST /api/resume/upload
router.post('/upload', protect, upload.single('resume'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  try {
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      res.status(400).json({ message: 'Could not extract text from file' });
      return;
    }

    const resume = await Resume.create({
      userId: req.user!._id,
      fileName: req.file.originalname,
      originalText: extractedText,
      fileSize: req.file.size,
    });

    res.status(201).json({
      _id: resume._id,
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      uploadedAt: resume.createdAt,
      preview: extractedText.substring(0, 300) + '...',
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// GET /api/resume - Get all resumes for current user
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/resume/:id
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }
    res.json({ message: 'Resume deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
