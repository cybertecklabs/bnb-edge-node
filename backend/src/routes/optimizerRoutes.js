const express = require('express');
const { getProfitRates, saveSettings, getOptimizationLog } = require('../controllers/optimizerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['PROVIDER']));

router.get('/profit-rates', getProfitRates);
router.post('/save-settings', validate(schemas.saveSettings), saveSettings);
router.get('/log', getOptimizationLog);

module.exports = router;
