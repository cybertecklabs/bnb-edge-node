import express from 'express';
import * as proxyController from '../controllers/proxyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', proxyController.getProxies);
router.post('/', proxyController.addProxy);
router.post('/assign', proxyController.assignProxy);
router.post('/buy', proxyController.buyTraffic);

export default router;
