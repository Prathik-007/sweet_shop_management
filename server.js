const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser

// Define a simple test route
app.get('/', (req, res) => res.send('Sweet Shop API Running'));

// We will add our real routes here later
// app.use('/api/auth', require('./src/routes/auth'));
// app.use('/api/sweets', require('./src/routes/sweets'));

const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Export for testing
module.exports = { app, server };