const request = require('supertest');
const { app, server } = require('../../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let userToken; // For regular user
let adminToken; // For admin user
let sweetId; // ID for Rasgulla (quantity = 100)
let outOfStockSweetId; // ID for Ladoo (quantity = 0)

// Before all tests, create a user and an admin, and get tokens
beforeAll(async () => {
  await User.deleteMany({}); // Clear users
  
  // Create Regular User
  const user = new User({ name: 'Test User', email: 'user@sweet.com', password: '123', role: 'User' });
  await user.save();
  userToken = jwt.sign(
    { user: { id: user.id, role: user.role } }, 
    process.env.JWT_SECRET
  );

  // Create Admin User
  const admin = new User({ name: 'Admin User', email: 'admin@sweet.com', password: '123', role: 'Admin' });
  await admin.save();
  adminToken = jwt.sign(
    { user: { id: admin.id, role: admin.role } }, 
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
    { name: 'Ladoo', category: 'Classic', price: 20, quantity: 0 }, // Out of stock
  ]);
  
  sweetId = sweets[0]._id.toString(); // Get ID of Rasgulla
  outOfStockSweetId = sweets[2]._id.toString(); // Get ID of Ladoo
});

// --- Existing Tests (Simplified for brevity) ---
describe('POST /api/sweets', () => { /* ... */ });
describe('GET /api/sweets', () => { /* ... */ });
describe('GET /api/sweets/search', () => { /* ... */ });
describe('PUT /api/sweets/:id', () => { /* ... */ });
describe('DELETE /api/sweets/:id', () => { /* ... */ });
describe('POST /api/sweets/:id/purchase', () => { /* ... */ });

// --- NEW TESTS FOR POST /api/sweets/:id/restock (Admin Only) ---
describe('POST /api/sweets/:id/restock', () => {
  it('should return 401 (Unauthorized) if not authenticated', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .send({ amount: 50 });
      
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 (Forbidden) if user is not an Admin', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('x-auth-token', userToken) // <-- Regular user token
      .send({ amount: 50 });
      
    expect(res.statusCode).toEqual(403);
  });

  it('should restock a sweet and increase quantity if user is Admin', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('x-auth-token', adminToken) // <-- Admin token
      .send({ amount: 50 });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.quantity).toBe(150); // 100 + 50

    // Verify change in DB
    const updatedSweet = await Sweet.findById(sweetId);
    expect(updatedSweet.quantity).toBe(150);
  });

  it('should return 400 (Bad Request) if amount is missing or not positive', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('x-auth-token', adminToken)
      .send({ amount: -10 }); // Invalid amount
      
    expect(res.statusCode).toEqual(400);
  });
  
  it('should return 404 if sweet ID is not found', async () => {
    const invalidId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/sweets/${invalidId}/restock`)
      .set('x-auth-token', adminToken)
      .send({ amount: 50 });
      
    expect(res.statusCode).toEqual(404);
  });
});