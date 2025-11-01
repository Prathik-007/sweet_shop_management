const request = require('supertest');
const { app, server } = require('../../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let token; // We'll store our auth token here
let userId;
let sweetToUpdateId; // <-- ADD THIS

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
  const sweets = await Sweet.insertMany([
    { name: 'Rasgulla', category: 'Syrup', price: 30, quantity: 100 },
    { name: 'Jalebi', category: 'Syrup', price: 50, quantity: 200 },
    { name: 'Kaju Katli', category: 'Cashew', price: 100, quantity: 50 },
  ]);
  
  sweetToUpdateId = sweets[0]._id.toString(); // <-- GET ID OF RASGULLA
});

describe('POST /api/sweets', () => {
  // ... (existing POST tests)
  it('should add a new sweet when authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('x-auth-token', token)
      .send({
        name: 'Ladoo',
        category: 'Classic',
        price: 20,
        quantity: 150,
      });

    expect(res.statusCode).toEqual(201); 
    expect(res.body.name).toBe('Ladoo');
  });

  it('should return 401 (Unauthorized) if not authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .send({ name: 'Ladoo' });

    expect(res.statusCode).toEqual(401);
  });
});

describe('GET /api/sweets', () => {
  // ... (existing GET tests)
  it('should return a list of all sweets when authenticated', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3); // From our beforeEach block
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .get('/api/sweets');
      
    expect(res.statusCode).toEqual(401);
  });
});

describe('GET /api/sweets/search', () => {
  // ... (existing GET /search tests)
  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/sweets/search');
    expect(res.statusCode).toEqual(401);
  });

  it('should find sweets by name (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/sweets/search?name=kaju') // Search for 'kaju'
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Kaju Katli');
  });

  it('should find sweets by category', async () => {
    const res = await request(app)
      .get('/api/sweets/search?category=Syrup')
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Rasgulla');
  });

  it('should find sweets by price range', async () => {
    const res = await request(app)
      .get('/api/sweets/search?minPrice=40&maxPrice=60')
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Jalebi');
  });

  it('should return an empty array if no sweets match', async () => {
    const res = await request(app)
      .get('/api/sweets/search?name=Chocolate')
      .set('x-auth-token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });
});

// --- NEW TESTS FOR PUT /api/sweets/:id ---
describe('PUT /api/sweets/:id', () => {
  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetToUpdateId}`)
      .send({ name: 'New Rasgulla' });
      
    expect(res.statusCode).toEqual(401);
  });

  it('should update a sweet when authenticated', async () => {
    const newName = 'Premium Rasgulla';
    const newPrice = 40;
    
    const res = await request(app)
      .put(`/api/sweets/${sweetToUpdateId}`)
      .set('x-auth-token', token)
      .send({
        name: newName,
        price: newPrice,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe(newName);
    expect(res.body.price).toBe(newPrice);

    // Verify change in DB
    const updatedSweet = await Sweet.findById(sweetToUpdateId);
    expect(updatedSweet.name).toBe(newName);
  });

  it('should return 404 if sweet ID is not found', async () => {
    const invalidId = new mongoose.Types.ObjectId().toString(); // A valid but non-existent ID
    
    const res = await request(app)
      .put(`/api/sweets/${invalidId}`)
      .set('x-auth-token', token)
      .send({ name: 'No Sweet' });
      
    expect(res.statusCode).toEqual(404);
  });
});