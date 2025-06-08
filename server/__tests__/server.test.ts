/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
import { createClient } from '@supabase/supabase-js';
import { jest } from '@jest/globals';

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
jest.mock('@supabase/supabase-js', () => {
  const makeThenable = (result: any) => ({
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej),
  });

  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => {
          const promise: any = makeThenable({ data: data[table], error: null });
          promise.eq = (field: string, value: any) => {
            const records = data[table].filter((r: any) => r[field] === value);
            const eqPromise: any = makeThenable({ data: records, error: null });
            eqPromise.single = () =>
              Promise.resolve({ data: records[0] || null, error: null });
            return eqPromise;
          };
          promise.single = () =>
            Promise.resolve({ data: data[table][0] || null, error: null });
          return promise;
        },
        insert: (values: any) => {
          const arr = Array.isArray(values) ? values : [values];
          const inserted = arr.map(v => ({ id: Date.now(), ...v }));
          data[table].push(...inserted);
          return {
            select: () => ({
              single: () =>
                Promise.resolve({ data: inserted[0], error: null }),
            }),
          };
        },
        update: (values: any) => ({
          eq: (field: string, value: any) => ({
            select: () => ({
              single: () => {
                const idx = data[table].findIndex((r: any) => r[field] === value);
                if (idx !== -1)
                  data[table][idx] = { ...data[table][idx], ...values };
                return Promise.resolve({ data: data[table][idx] || null, error: null });
              },
            }),
          }),
        }),
        delete: () => ({
          eq: (field: string, value: any) => ({
            select: () => ({
              single: () => {
                const idx = data[table].findIndex((r: any) => r[field] === value);
                const removed = idx !== -1 ? data[table].splice(idx, 1)[0] : null;
                return Promise.resolve({ data: removed, error: null });
              },
            }),
          }),
        }),
      }),
    }),
  };
});

let app: Express;
beforeAll(async () => {
  process.env.SUPABASE_URL = 'http://localhost';
  process.env.SUPABASE_ANON_KEY = 'testkey';
  const mod = await import('../server');
  app = mod.default as Express;
});

beforeEach(() => {
  data = JSON.parse(JSON.stringify(seed));
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
