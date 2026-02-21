require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const nodeRoutes = require('./routes/nodeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const farmRoutes = require('./routes/farmRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const optimizerRoutes = require('./routes/optimizerRoutes');
const epochRoutes = require('./routes/epochRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — try again later' },
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/proxies', proxyRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/epoch', epochRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (_req, res) => res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
    ts: new Date(),
}));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
