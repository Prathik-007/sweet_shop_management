const request = require('supertest');
const { app, server } = require('../../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User =require('../models/User');
const jwt = require('jsonwebtoken');

let userToken; // For regular user
let adminToken; // For admin user
let sweetToDeleteId;

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
  ]);
  
  sweetToDeleteId = sweets[0]._id.toString(); // Get ID of Rasgulla
});

// --- POST /api/sweets ---
describe('POST /api/sweets', () => {
  it('should add a new sweet when authenticated', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('x-auth-token', userToken) // Any authenticated user can add
      .send({ name: 'Ladoo', category: 'Classic', price: 20, quantity: 150 });
    expect(res.statusCode).toEqual(201); 
  });
});

// --- GET /api/sweets ---
describe('GET /api/sweets', () => {
  it('should return a list of all sweets when authenticated', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });
});

// --- GET /api/sweets/search ---
describe('GET /api/sweets/search', () => {
  it('should find sweets by category', async () => {
    const res = await request(app)
      .get('/api/sweets/search?category=Syrup')
      .set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });
});

// --- PUT /api/sweets/:id ---
describe('PUT /api/sweets/:id', () => {
  it('should update a sweet when authenticated', async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetToDeleteId}`)
      .set('x-auth-token', userToken) // Any authenticated user can update
      .send({ name: 'Premium Rasgulla' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('Premium Rasgulla');
  });
});

// --- NEW TESTS FOR DELETE /api/sweets/:id (Admin Only) ---
describe('DELETE /api/sweets/:id', () => {
  it('should return 401 (Unauthorized) if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetToDeleteId}`);
      
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 (Forbidden) if user is not an Admin', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetToDeleteId}`)
      .set('x-auth-token', userToken); // <-- Using regular user token
      
    expect(res.statusCode).toEqual(403);
  });

  it('should delete the sweet if user is an Admin', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetToDeleteId}`)
      .set('x-auth-token', adminToken); // <-- Using admin token
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toBe('Sweet removed');

    // Verify it's gone from the DB
    const sweet = await Sweet.findById(sweetToDeleteId);
    expect(sweet).toBeNull();
  });

  it('should return 404 if sweet ID is not found', async () => {
    const invalidId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/sweets/${invalidId}`)
      .set('x-auth-token', adminToken);
      
    expect(res.statusCode).toEqual(404);
  });
});