"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const auth_1 = require("../middleware/auth");
const Resume_1 = __importDefault(require("../models/Resume"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
        }
    },
});
// POST /api/resume/upload
router.post('/upload', auth_1.protect, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    try {
        let extractedText = '';
        if (req.file.mimetype === 'application/pdf') {
            const data = await (0, pdf_parse_1.default)(req.file.buffer);
            extractedText = data.text;
        }
        else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth_1.default.extractRawText({ buffer: req.file.buffer });
            extractedText = result.value;
        }
        else {
            extractedText = req.file.buffer.toString('utf-8');
        }
        if (!extractedText.trim()) {
            res.status(400).json({ message: 'Could not extract text from file' });
            return;
        }
        const resume = await Resume_1.default.create({
            userId: req.user._id,
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
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Upload failed' });
    }
});
// GET /api/resume - Get all resumes for current user
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const resumes = await Resume_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(resumes);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/resume/:id
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const resume = await Resume_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        res.json({ message: 'Resume deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
