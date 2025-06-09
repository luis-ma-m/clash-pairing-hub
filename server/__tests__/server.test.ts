/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
// @ts-expect-error - provided by Jest mock
import { __setMockData } from '@supabase/supabase-js';

// Inline seed data used by the mocked Supabase client
const seed = {
  teams: [
    { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'] }
  ],
  pairings: [
    { id: 1, round: 1, room: 'A1', proposition: 'Alpha', opposition: 'Beta', judge: 'Judge', status: 'scheduled', propWins: null }
  ],
  scores: [
    { id: 1, room: 'A1', speaker: 'A1', team: 'Alpha', total: 75 }
  ],
  settings: [
    { id: 1, currentRound: 1 }
  ],
  debates: [],
  users: [],
  brackets: []
};
let data: any = JSON.parse(JSON.stringify(seed));

// Mock Supabase client with a minimal query builder supporting the chained calls
// used throughout the API routes. Each method returns a Promise-like object so
// that `await` works as expected while also exposing `eq`, `single` and `select`
// where needed.

let app: Express;
beforeAll(async () => {
  process.env.SUPABASE_URL = 'http://localhost';
  process.env.SUPABASE_ANON_KEY = 'testkey';
  const mod = await import('../server');
  app = mod.default as Express;
});

beforeEach(() => {
  data = JSON.parse(JSON.stringify(seed));
  __setMockData(data);
});

describe('Core API Endpoints', () => {
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

  it('POST /api/bracket should generate a bracket', async () => {
    const res = await request(app)
      .post('/api/bracket')
      .send({ type: 'single' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/scores/:room should return scores', async () => {
    const res = await request(app).get('/api/scores/A1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Users CRUD', () => {
  it('GET /api/users should return an array', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/users should create a user', async () => {
    const user = { name: 'John Doe', email: 'john@example.com', role: 'Judge' };
    const res = await request(app).post('/api/users').send(user);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(user.name);
  });

  it('PUT /api/users/:id should update a user', async () => {
    const create = await request(app)
      .post('/api/users')
      .send({ name: 'Jane', email: 'jane@example.com', role: 'Judge' });
    const res = await request(app)
      .put(`/api/users/${create.body.id}`)
      .send({ name: 'Jane Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jane Updated');
  });

  it('DELETE /api/users/:id should remove a user', async () => {
    const create = await request(app)
      .post('/api/users')
      .send({ name: 'Temp', email: 'temp@example.com', role: 'Judge' });
    const res = await request(app).delete(`/api/users/${create.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(create.body.id);
  });
});
