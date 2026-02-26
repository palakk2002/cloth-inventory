const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const registerRoutes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}));

// ── Body Parsers ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', message: 'Cloth Inventory API is running', timestamp: new Date() });
});

// ── Module Routes ─────────────────────────────────────────────────
registerRoutes(app);

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
