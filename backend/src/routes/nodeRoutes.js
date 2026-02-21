const express = require('express');
const { getNodes, getAllNodes, registerNode, sendHeartbeat, deregisterNode } = require('../controllers/nodeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware);

router.get('/all', getAllNodes);
router.get('/', roleMiddleware(['PROVIDER']), getNodes);
router.post('/register', roleMiddleware(['PROVIDER', 'CLIENT']), validate(schemas.registerNode), registerNode);
router.post('/heartbeat', roleMiddleware(['PROVIDER']), sendHeartbeat);
router.delete('/:id', roleMiddleware(['PROVIDER']), deregisterNode);

module.exports = router;
