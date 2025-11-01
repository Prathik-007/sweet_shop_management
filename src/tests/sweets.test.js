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
  const user = new User({ name: 'Test', email: 'test@sweet.com', password: '123' }); 
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

// Before each test, clear and re-populate the sweets collection
beforeEach(async () => {
  await Sweet.deleteMany({});
  
  // Add sample sweets
  await Sweet.insertMany([
    { name: 'Rasgulla', category: 'Syrup', price: 30, quantity: 100 },
    { name: 'Jalebi', category: 'Syrup', price: 50, quantity: 200 },
  ]);
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

    expect(res.statusCode).toEqual(201); 
    expect(res.body.name).toBe('Kaju Katli');
  });

  it('should return 401 (Unauthorized) if not authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .send({ name: 'Ladoo' });

    expect(res.statusCode).toEqual(401);
  });
});

// --- NEW TESTS FOR GET /api/sweets ---
describe('GET /api/sweets', () => {
  it('should return a list of all sweets when authenticated', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2); // From our beforeEach block
    expect(res.body[0].name).toBe('Rasgulla');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .get('/api/sweets');
      
    expect(res.statusCode).toEqual(401);
  });
});