const express = require('express');
const { getNonce, verifySiwe, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, schemas } = require('../utils/validate');

const router = express.Router();

router.get('/nonce', getNonce);
router.post('/verify', validate(schemas.siweVerify), verifySiwe);
router.get('/me', authMiddleware, getMe);

module.exports = router;
