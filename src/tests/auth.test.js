const request = require('supertest');
const { app, server } = require('../../server'); // Import app and server from server.js
const mongoose = require('mongoose');
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');

// Close server and DB connection after all tests are done
afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

// Clear the User collection and add a test user before each test
beforeEach(async () => {
  await User.deleteMany({});

  // Create a sample user for login tests
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  await new User({
    name: 'Login User',
    email: 'login@example.com',
    password: hashedPassword,
  }).save();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201); 
    expect(res.body).toHaveProperty('token');

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
    expect(user.name).toBe('Test User');
  });

  it('should return 400 for a missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
      });

    expect(res.statusCode).toEqual(400);
  });
});

// --- NEW TESTS FOR LOGIN ---
describe('POST /api/auth/login', () => {
  it('should log in an existing user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123', // The correct, unhashed password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 for a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
  });
});