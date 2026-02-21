const express = require('express');
const router = express.Router();
const epochController = require('../controllers/epochController');

router.post('/submit', epochController.submitEpoch);
router.get('/proof', epochController.getWorkerProof);   // GET /api/epoch/proof?address=0x...
router.get('/:id/proof', epochController.getEpochProof); // GET /api/epoch/1/proof (full epoch data)

module.exports = router;
