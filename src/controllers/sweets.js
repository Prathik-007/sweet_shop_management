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