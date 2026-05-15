"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const resume_1 = __importDefault(require("./routes/resume"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const handlers_1 = require("./socket/handlers");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Attach io to request object
app.use((req, _res, next) => {
    req.io = io;
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/resume', resume_1.default);
app.use('/api/analysis', analysis_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'AI Resume Analyzer API is running' });
});
// Socket.io handlers
(0, handlers_1.setupSocketHandlers)(io);
// MongoDB connection
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
