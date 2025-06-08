/** @jest-environment node */
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import type { Express } from 'express';
import server from '../server';

const dbPath = path.join(__dirname, '../db.json');
let originalDb = '';

beforeEach(() => {
  originalDb = fs.readFileSync(dbPath, 'utf8');
});

afterEach(() => {
  fs.writeFileSync(dbPath, originalDb);
});

const app: Express = server as Express;

describe('API Endpoints', () => {
  it('GET /api/teams should return teams', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('POST /api/teams should create a team', async () => {
    const team = { name: 'Test Team', organization: 'Test Org', speakers: ['A', 'B'] };
    const res = await request(app).post('/api/teams').send(team);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(team.name);
  });

  it('GET /api/pairings should return pairings with currentRound', async () => {
    const res = await request(app).get('/api/pairings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pairings');
    expect(Array.isArray(res.body.pairings)).toBe(true);
    expect(res.body).toHaveProperty('currentRound');
  });

  it('GET /api/scores/:room should return scores', async () => {
    const res = await request(app).get('/api/scores/A1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Analytics endpoints
  it('GET /api/analytics/standings should return standings', async () => {
    const res = await request(app).get('/api/analytics/standings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/speakers should return speaker stats', async () => {
    const res = await request(app).get('/api/analytics/speakers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/performance should return performance over rounds', async () => {
    const res = await request(app).get('/api/analytics/performance');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/results should return a results summary', async () => {
    const res = await request(app).get('/api/analytics/results');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('propWins');
    expect(res.body).toHaveProperty('oppWins');
    expect(res.body).toHaveProperty('ties');
  });
});

describe('Users API', () => {
  it('GET /api/users should return users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/users should create a user', async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'TabDirector',
      permissions: [],
      lastActive: 'now',
      status: 'active',
    };
    const res = await request(app).post('/api/users').send(user);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(user.name);
  });

  it('PUT /api/users/:id should update a user', async () => {
    const create = await request(app).post('/api/users').send({
      name: 'Jane',
      email: 'jane@example.com',
      role: 'Judge',
      permissions: [],
      lastActive: 'now',
      status: 'active',
    });
    const id = create.body.id;
    const res = await request(app).put(`/api/users/${id}`).send({ name: 'Jane Doe' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jane Doe');
  });

  it('DELETE /api/users/:id should remove a user', async () => {
    const create = await request(app).post('/api/users').send({
      name: 'Delete',
      email: 'delete@example.com',
      role: 'Judge',
      permissions: [],
      lastActive: 'now',
      status: 'active',
    });
    const id = create.body.id;
    const res = await request(app).delete(`/api/users/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });
});
