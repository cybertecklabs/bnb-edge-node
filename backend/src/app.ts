import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';
import clusterRoutes from './routes/clusterRoutes.js';
import optimizerRoutes from './routes/optimizerRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/proxies', proxyRoutes);
app.use('/api/cluster', clusterRoutes);
app.use('/api/optimizer', optimizerRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'DePIN Farm OS API' }));

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
