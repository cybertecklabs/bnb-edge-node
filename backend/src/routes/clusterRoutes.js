const express = require('express');
const { getClusters, createCluster, startVm, stopVm } = require('../controllers/clusterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['PROVIDER']));

router.get('/', getClusters);
router.post('/', validate(schemas.createCluster), createCluster);
router.post('/start-vm', startVm);
router.post('/stop-vm', stopVm);

module.exports = router;
