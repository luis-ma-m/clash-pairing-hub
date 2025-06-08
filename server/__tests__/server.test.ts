/** @jest-environment node */
import request from 'supertest';

let app: import('express').Express;

beforeAll(async () => {
  const mod = await import('../server.ts');
  app = mod.default;
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
});
