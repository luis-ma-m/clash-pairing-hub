/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';

// Mock our LowDB module so scores start empty and writes/read are jest fns
;(jest as any).unstable_mockModule('../db.ts', () => {
  const db = { data: { scores: [] }, read: jest.fn(), write: jest.fn() };
  return { __esModule: true, default: db, initDB: jest.fn() };
});

let app: Express;

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
    expect(Array.isArray(res.body.pairings)).toBe(true);
  });

  it('GET /api/scores/:room should return scores', async () => {
    const res = await request(app).get('/api/scores/A1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/scores should save a score', async () => {
    const score = {
      room: 'A1',
      speaker: 'Test Speaker',
      team: 'Test Team',
      position: 'PM',
      content: 80,
      style: 80,
      strategy: 80,
      total: 240
    };
    const res = await request(app).post('/api/scores').send(score);
    expect(res.status).toBe(201);

    // After POST, our mock DB.write was called and scores array updated in-memory
    const verify = await request(app).get('/api/scores/A1');
    expect(verify.body.some((s: any) => s.speaker === score.speaker)).toBe(true);
  });
});
