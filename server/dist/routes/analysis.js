"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Resume_1 = __importDefault(require("../models/Resume"));
const Analysis_1 = __importDefault(require("../models/Analysis"));
const openai_1 = require("../services/openai");
const router = (0, express_1.Router)();
// POST /api/analysis/analyze
router.post('/analyze', auth_1.protect, async (req, res) => {
    const { resumeId, jobDescription, jobTitle } = req.body;
    if (!resumeId || !jobDescription || !jobTitle) {
        res.status(400).json({ message: 'resumeId, jobDescription, and jobTitle are required' });
        return;
    }
    try {
        const resume = await Resume_1.default.findOne({ _id: resumeId, userId: req.user._id });
        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        // Notify via socket that analysis is starting
        req.io?.to(req.user._id.toString()).emit('analysis:start', { resumeId });
        const result = await (0, openai_1.analyzeResume)(resume.originalText, jobDescription, jobTitle);
        const analysis = await Analysis_1.default.create({
            userId: req.user._id,
            resumeId,
            jobDescription,
            jobTitle,
            ...result,
        });
        // Increment resume analysis count
        await Resume_1.default.findByIdAndUpdate(resumeId, { $inc: { analysisCount: 1 } });
        // Notify via socket that analysis is complete
        req.io?.to(req.user._id.toString()).emit('analysis:complete', {
            analysisId: analysis._id,
            overallScore: result.overallScore,
        });
        res.status(201).json(analysis);
    }
    catch (err) {
        req.io?.to(req.user._id.toString()).emit('analysis:error', { message: err.message });
        res.status(500).json({ message: err.message || 'Analysis failed' });
    }
});
// GET /api/analysis - Get all analyses for current user
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const analyses = await Analysis_1.default.find({ userId: req.user._id })
            .populate('resumeId', 'fileName')
            .sort({ createdAt: -1 });
        res.json(analyses);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/analysis/:id - Get single analysis
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const analysis = await Analysis_1.default.findOne({ _id: req.params.id, userId: req.user._id }).populate('resumeId', 'fileName');
        if (!analysis) {
            res.status(404).json({ message: 'Analysis not found' });
            return;
        }
        res.json(analysis);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/analysis/:id
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const analysis = await Analysis_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!analysis) {
            res.status(404).json({ message: 'Analysis not found' });
            return;
        }
        res.json({ message: 'Analysis deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
