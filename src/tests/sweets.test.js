const request = require('supertest');
const { app, server } = require('../../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let token; // We'll store our auth token here
let userId;

// Before all tests, create a user and get a token
beforeAll(async () => {
  await User.deleteMany({}); // Clear users
  const user = new User({ name: 'Test', email: 'test@sweet.com', password: '123' }); // No need to hash, just for token
  await user.save();
  userId = user.id;
  
  // Create a token manually for testing
  token = jwt.sign(
    { user: { id: userId, role: 'User' } }, 
    process.env.JWT_SECRET
  );
});

// After all tests, close connections
afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

// Before each test, clear the sweets collection
beforeEach(async () => {
  await Sweet.deleteMany({});
});

describe('POST /api/sweets', () => {
  it('should add a new sweet when authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('x-auth-token', token) // Set the auth token in the header
      .send({
        name: 'Kaju Katli',
        category: 'Cashew',
        price: 100,
        quantity: 50,
      });

    expect(res.statusCode).toEqual(201); // 201 Created
    expect(res.body.name).toBe('Kaju Katli');

    // Check if it's in the database
    const sweet = await Sweet.findOne({ name: 'Kaju Katli' });
    expect(sweet).not.toBeNull();
  });

  it('should return 401 (Unauthorized) if not authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .send({
        name: 'Ladoo',
        category: 'Classic',
        price: 20,
        quantity: 10,
      });

    expect(res.statusCode).toEqual(401);
  });
});