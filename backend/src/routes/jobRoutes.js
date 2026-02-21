const express = require('express');
const { getJobs, getJob, createJob, acceptJob, submitResult, getActivity } = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['PROVIDER', 'CLIENT']));

router.get('/activity', getActivity);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', validate(schemas.createJob), createJob);
router.post('/:id/accept', roleMiddleware(['PROVIDER']), acceptJob);
router.post('/:id/submit', roleMiddleware(['PROVIDER']), validate(schemas.submitResult), submitResult);

module.exports = router;
