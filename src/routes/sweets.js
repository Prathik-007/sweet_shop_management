const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import our new auth middleware
const sweetsController = require('../controllers/sweets');

// @route   POST /api/sweets
// @desc    Add a new sweet
// @access  Protected
router.post('/', auth, sweetsController.addSweet); // <-- 'auth' middleware is applied here

// @route   GET /api/sweets         <-- ADD THIS BLOCK
// @desc    Get all sweets
// @access  Protected
router.get('/', auth, sweetsController.getAllSweets);

module.exports = router;