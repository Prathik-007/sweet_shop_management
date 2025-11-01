const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation (to pass the second test)
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Include the role in the token
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        // Return 201 Created (to pass the first test)
        res.status(201).json({ token }); 
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};