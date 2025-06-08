/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read the seed data using the real fs module before mocking
const fsActual = jest.requireActual('fs') as typeof import('fs');
const dbPath = path.join(__dirname, '../db.json');
const seed = JSON.parse(fsActual.readFileSync(dbPath, 'utf8'));
let data: any = JSON.parse(JSON.stringify(seed));

// Mock fs.promises so the server reads/writes from in-memory data
jest.doMock('fs', () => ({
  promises: {
    readFile: async () => JSON.stringify(data),
    writeFile: async (_: string, content: string) => {
      data = JSON.parse(content);
    },
  },
}));

// Mock Supabase client methods to operate on the in-memory data
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: (table: string) => ({
        select: async () => ({ data: data[table], error: null }),
        insert: async (values: any) => {
          const arr = Array.isArray(values) ? values : [values];
          const inserted = arr.map(v => ({ id: Date.now(), ...v }));
          data[table].push(...inserted);
          return { data: inserted, error: null };
        },
        update: (values: any) => ({
          eq: (field: string, id: any) => ({
            select: async () => {
              const idx = data[table].findIndex((r: any) => r[field] === id);
              if (idx !== -1) data[table][idx] = { ...data[table][idx], ...values };
              return { data: idx !== -1 ? [data[table][idx]] : [], error: null };
            },
          }),
        }),
        delete: () => ({
          eq: (field: string, id: any) => ({
            select: async () => {
              const idx = data[table].findIndex((r: any) => r[field] === id);
              const removed = idx !== -1 ? data[table].splice(idx, 1) : [];
              return { data: removed, error: null };
            },
          }),
        }),
      }),
    }),
  };
});

let app: Express;
beforeAll(async () => {
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
