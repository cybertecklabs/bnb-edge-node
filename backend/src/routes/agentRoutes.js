const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/status', authMiddleware, agentController.getStatus);
router.post('/command', authMiddleware, agentController.sendCommand);

module.exports = router;
