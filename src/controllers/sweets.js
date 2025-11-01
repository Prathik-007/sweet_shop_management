const Sweet = require('../models/Sweet');

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