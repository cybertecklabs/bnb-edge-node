import express from 'express';
import * as optimizerController from '../controllers/optimizerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/rates', optimizerController.getProfitRates);
router.post('/settings', optimizerController.saveSettings);
router.get('/logs', optimizerController.getOptimizationLog);

export default router;
