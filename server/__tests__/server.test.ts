/** @jest-environment node */
import request from 'supertest';

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
    JSONFile: class<T> { constructor(_path: string) {} }
  };
});

let app: any;

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

  it('GET /api/analytics/standings should return standings', async () => {
    const res = await request(app).get('/api/analytics/standings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/speakers should return speakers', async () => {
    const res = await request(app).get('/api/analytics/speakers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/performance should return performance', async () => {
    const res = await request(app).get('/api/analytics/performance');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/analytics/results should return results summary', async () => {
    const res = await request(app).get('/api/analytics/results');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('propWins');
  });
});
