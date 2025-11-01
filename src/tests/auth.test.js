const request = require('supertest');
const { app, server } = require('../../server'); // Import app and server from server.js
const mongoose = require('mongoose');
const User = require('../models/User'); // Import the User model

// Close server and DB connection after all tests are done
afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

// Clear the User collection before each test
beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register') // This endpoint doesn't exist yet
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    // We expect a 201 "Created" status
    expect(res.statusCode).toEqual(201); 
    // We expect it to return a 'token' in the body
    expect(res.body).toHaveProperty('token');

    // We also expect the user to be saved in the database
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

    // We expect a 400 "Bad Request" status
    expect(res.statusCode).toEqual(400);
  });
});