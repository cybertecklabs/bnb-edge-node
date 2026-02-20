import express from 'express';
import * as clusterController from '../controllers/clusterController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', clusterController.getClusters);
router.post('/', clusterController.createCluster);
router.post('/start-vm', clusterController.startVm);

export default router;
