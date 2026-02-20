import express from 'express';
import * as farmController from '../controllers/farmController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Only PROVIDER roles can manage farms
router.use(authMiddleware, roleMiddleware(['PROVIDER', 'CLIENT'])); // Defaulting to all for now

router.get('/profiles', farmController.getProfiles);
router.post('/profiles', farmController.createProfile);
router.post('/profiles/:id/launch', farmController.launchProfile);
router.post('/profiles/:id/stop', farmController.stopProfile);
router.get('/earnings', farmController.getEarnings);

export default router;
