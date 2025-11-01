const Sweet = require('../models/Sweet');
const mongoose = require('mongoose');

exports.addSweet = async (req, res) => {
  const { name, category, price, quantity } = req.body;

  // Simple validation
  if (!name || !category || !price || quantity === undefined) {
    return res.status(400).json({ msg: 'Please provide all fields' });
  }

  try {
    const newSweet = new Sweet({
      name,
      category,
      price,
      quantity,
    });

    const sweet = await newSweet.save();
    res.status(201).json(sweet); // Return 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.status(200).json(sweets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    
    let query = {};

    if (name) {
      // 'i' flag makes it case-insensitive
      query.name = { $regex: name, $options: 'i' }; 
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        // $gte = greater than or equal to
        query.price.$gte = Number(minPrice); 
      }
      if (maxPrice) {
        // $lte = less than or equal to
        query.price.$lte = Number(maxPrice);
      }
    }

    const sweets = await Sweet.find(query);
    res.status(200).json(sweets);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.updateSweet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for a valid Mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    let sweet = await Sweet.findById(id);

    // Check if sweet exists (to pass the 404 test)
    if (!sweet) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    // Find the sweet by ID and update it with the new data from req.body
    // { new: true } returns the modified document rather than the original
    sweet = await Sweet.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(sweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for a valid Mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    const sweet = await Sweet.findById(id);

    // Check if sweet exists (to pass the 404 test)
    if (!sweet) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    // Find by ID and remove
    await Sweet.findByIdAndDelete(id);

    res.status(200).json({ msg: 'Sweet removed' }); // To pass the test
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for a valid Mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    const sweet = await Sweet.findById(id);

    // Check if sweet exists
    if (!sweet) {
      return res.status(404).json({ msg: 'Sweet not found' });
    }

    // Check if sweet is in stock (to pass the 400 test)
    if (sweet.quantity === 0) {
      return res.status(400).json({ msg: 'Sweet is out of stock' });
    }

    // Find by ID and decrement the quantity by 1
    // Using $inc is an atomic operation, safer for concurrent requests
    const updatedSweet = await Sweet.findByIdAndUpdate(
      id,
      { $inc: { quantity: -1 } },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedSweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};