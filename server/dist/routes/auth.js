"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const generateToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    try {
        const exists = await User_1.default.findOne({ email });
        if (exists) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const user = await User_1.default.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password required' });
        return;
    }
    try {
        const user = await User_1.default.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.protect, async (req, res) => {
    res.json(req.user);
});
exports.default = router;
