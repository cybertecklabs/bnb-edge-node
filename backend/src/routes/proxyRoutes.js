const express = require('express');
const { getProxies, addProxy, assignProxy, buyTraffic } = require('../controllers/proxyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['PROVIDER']));

router.get('/', getProxies);
router.post('/add', validate(schemas.addProxy), addProxy);
router.post('/assign', validate(schemas.assignProxy), assignProxy);
router.post('/buy', validate(schemas.buyTraffic), buyTraffic);

module.exports = router;
