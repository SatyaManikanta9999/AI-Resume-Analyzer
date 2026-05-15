import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Resume from '../models/Resume';
import Analysis from '../models/Analysis';
import { analyzeResume } from '../services/openai';

const router = Router();

// POST /api/analysis/analyze
router.post('/analyze', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeId, jobDescription, jobTitle } = req.body;

  if (!resumeId || !jobDescription || !jobTitle) {
    res.status(400).json({ message: 'resumeId, jobDescription, and jobTitle are required' });
    return;
  }

  try {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    // Notify via socket that analysis is starting
    req.io?.to(req.user!._id.toString()).emit('analysis:start', { resumeId });

    const result = await analyzeResume(resume.originalText, jobDescription, jobTitle);

    const analysis = await Analysis.create({
      userId: req.user!._id,
      resumeId,
      jobDescription,
      jobTitle,
      ...result,
    });

    // Increment resume analysis count
    await Resume.findByIdAndUpdate(resumeId, { $inc: { analysisCount: 1 } });

    // Notify via socket that analysis is complete
    req.io?.to(req.user!._id.toString()).emit('analysis:complete', {
      analysisId: analysis._id,
      overallScore: result.overallScore,
    });

    res.status(201).json(analysis);
  } catch (err: any) {
    req.io?.to(req.user!._id.toString()).emit('analysis:error', { message: err.message });
    res.status(500).json({ message: err.message || 'Analysis failed' });
  }
});

// GET /api/analysis - Get all analyses for current user
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analyses = await Analysis.find({ userId: req.user!._id })
      .populate('resumeId', 'fileName')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analysis/:id - Get single analysis
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user!._id }).populate('resumeId', 'fileName');
    if (!analysis) {
      res.status(404).json({ message: 'Analysis not found' });
      return;
    }
    res.json(analysis);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/analysis/:id
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!analysis) {
      res.status(404).json({ message: 'Analysis not found' });
      return;
    }
    res.json({ message: 'Analysis deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
