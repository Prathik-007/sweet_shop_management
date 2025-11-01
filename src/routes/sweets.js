const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin');
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

// @route   DELETE /api/sweets/:id  <-- ADD THIS BLOCK
// @desc    Delete a sweet (Admin Only)
// @access  Protected/Admin
router.delete('/:id', [auth, admin], sweetsController.deleteSweet); // <-- USE BOTH MIDDLEWARES 

// @route   POST /api/sweets/:id/purchase  <-- ADD THIS BLOCK
// @desc    Purchase a sweet
// @access  Protected
router.post('/:id/purchase', auth, sweetsController.purchaseSweet);

// @route   POST /api/sweets/:id/restock  <-- ADD THIS BLOCK
// @desc    Restock a sweet (Admin Only)
// @access  Protected/Admin
router.post('/:id/restock', [auth, admin], sweetsController.restockSweet);

module.exports = router;