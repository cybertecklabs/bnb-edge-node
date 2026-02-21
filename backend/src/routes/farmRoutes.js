const express = require('express');
const { getProfiles, createProfile, launchProfile, stopProfile, getEarnings } = require('../controllers/farmController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['PROVIDER']));

router.get('/profiles', getProfiles);
router.post('/profiles', validate(schemas.createProfile), createProfile);
router.post('/profiles/:id/launch', launchProfile);
router.post('/profiles/:id/stop', stopProfile);
router.get('/earnings', getEarnings);

module.exports = router;
