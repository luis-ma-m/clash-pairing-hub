/** @jest-environment node */
import request from 'supertest';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '../db.json');
let originalDb: string;

let app: any;

beforeAll(async () => {
  const mod = await import('../server.ts');
  app = mod.default;
  originalDb = fs.readFileSync(dbPath, 'utf-8');
});

afterEach(() => {
  fs.writeFileSync(dbPath, originalDb);
});

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

  it('GET /api/pairings should return pairings', async () => {
    const res = await request(app).get('/api/pairings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/scores/:room should return scores', async () => {
    const res = await request(app).get('/api/scores/A1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/users should return empty array', async () => {
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

  it('PUT /api/users/:id should update user', async () => {
    const create = await request(app).post('/api/users').send({ name: 'Jane', email: 'jane@example.com', role: 'Judge' });
    const res = await request(app).put(`/api/users/${create.body.id}`).send({ name: 'Jane Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jane Updated');
  });

  it('DELETE /api/users/:id should remove user', async () => {
    const create = await request(app).post('/api/users').send({ name: 'Temp', email: 'temp@example.com', role: 'Judge' });
    const res = await request(app).delete(`/api/users/${create.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(create.body.id);
  });
});
