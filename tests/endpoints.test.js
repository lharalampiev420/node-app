/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
/* eslint-disable import/no-unresolved */
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const supertest = require('supertest');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

dotenv.config({ path: './config.env' });

const app = require('../app');

const request = supertest(app);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

describe('Test tour controller', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // db = await connection.db(DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Get all tours', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/api/v1/tours/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    //done();
  });

  it('Get one tour by ID', async () => {
    const tour = await Tour.findOne();
    const res = await request.get(`/api/v1/tours/${tour.id}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('Throw an Error for calling a tour with wrong ID', async () => {
    const id = '2304wrong5';
    const res = await request.get(`/api/v1/tours/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.message.name).toBe('CastError');
  });

  // REQUIRES AUTHENTICATION TO BE REMOVED
  // it('Create a tour', async () => {
  //   const body = {
  //     name: 'Test document 11',
  //     difficulty: 'easy',
  //     duration: 5,
  //     maxGroupSize: 25,
  //     price: 397,
  //     summary: 'Breathtaking hike through the Canadian Banff National Park',
  //     imageCover: 'tour-1-cover.jpg',
  //     guides: ['62e94ca6e955660ea4f976f8'],
  //   };
  //   const res = await request.post(`/api/v1/tours/`).send(body);
  //   expect(res.status).toBe(201);
  //   expect(res.body.status).toBe('success');
  // }, 30000);

  // // REQUIRES AUTHENTICATION TO BE REMOVED
  // it('Delete a tour', async () => {
  //   const user = await Tour.findOne();
  //   const id = String(user._id);
  //   const res = await request.delete(`/api/v1/tours/${id}`);
  //   expect(res.status).toBe(204);
  // }, 30000);

  it('Get tour stats', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/api/v1/tours/tour-stats');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    //done();
  });

  it('Get top 5 cheapest tours', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/api/v1/tours/top-5-cheap');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    //done();
  });
});

describe('Test authentication controller', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // db = await connection.db(DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Login a user', async () => {
    const user = { email: 'admin@natours.io', password: 'test1234' };
    const res = await request.post('/api/v1/users/login').send(user);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    // ...
    //done();
  });

  it('Throw an error for incorrect user or password', async () => {
    try {
      const user = { email: 'admin@natours.io', password: 'test12345' };
      const res = await request.post('/api/v1/users/login').send(user);
    } catch (err) {
      expect(res.status).toBe(401);
      expect(res.status).toBe('fail');
    }
  });

  it('Signup a user', async () => {
    const pass = crypto.randomBytes(5).toString('hex');
    const user = {
      name: `${pass}`,
      email: `${pass}@abv.bg`,
      role: 'user',
      password: `${pass}`,
      passwordConfirm: `${pass}`,
    };
    const res = await request.post('/api/v1/users/signup').send(user);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
  }, 15000);
});

describe('Test user controller', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // db = await connection.db(DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Get all users', async () => {
    const res = await request.get('/api/v1/users/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    //done();
  });

  it('Get user by ID', async () => {
    const user = await User.findOne();
    const res = await request.get(`/api/v1/users/${user._id}`);
    expect(res.status).toBe(200);
  }, 10000);
});
