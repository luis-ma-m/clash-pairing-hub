/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';

// Mock lowdb so it reads from our JSON fixture and no actual file I/O occurs
jest.mock('lowdb', () => {
  const data = require('../db.json');
  return {
    Low: class<T> {
      data: T;
      constructor(_adapter: any, _defaultData: T) {
        this.data = data;
      }
      async read() {}
      async write() {}
    }
  };
});

jest.mock('lowdb/node', () => {
  return {
    JSONFile: class<T> {
      constructor(_path: string) {}
    }
  };
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
