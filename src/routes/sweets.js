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

// @route   GET /api/sweets/search   <-- ADD THIS BLOCK
// @desc    Search for sweets
// @access  Protected
router.get('/search', auth, sweetsController.searchSweets);

// @route   PUT /api/sweets/:id      <-- ADD THIS BLOCK
// @desc    Update a sweet
// @access  Protected
router.put('/:id', auth, sweetsController.updateSweet);

module.exports = router;