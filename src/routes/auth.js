const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.registerUser);

module.exports = router;