import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/nonce', authController.nonce);
router.post('/verify', authController.verify);
router.get('/me', authMiddleware, authController.me);

export default router;
