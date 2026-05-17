const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/request-email-otp', authController.requestEmailOtp);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
