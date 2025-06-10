/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
import { createClient } from '@supabase/supabase-js';
import { jest } from '@jest/globals';

const seed = {
  teams: [
    { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'] },
    { id: 2, name: 'Bravo', organization: 'Org', speakers: ['B1'] }
  ],
  pairings: [
    { id: 1, round: 1, room: 'A1', proposition: 'Alpha', opposition: 'Bravo', judge: 'J1', status: 'completed', propWins: true }
  ],
  scores: [
    { id: 1, room: 'A1', speaker: 'A1', team: 'Alpha', total: 75 },
    { id: 2, room: 'A1', speaker: 'B1', team: 'Bravo', total: 65 }
  ],
  settings: [
    { id: 1, currentRound: 1 }
  ],
  debates: [],
  users: [],
  brackets: []
};
let data: any = JSON.parse(JSON.stringify(seed));

jest.mock('@supabase/supabase-js', () => {
  const makeThenable = (result: any) => ({
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej)
  });
  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => {
          const promise: any = makeThenable({ data: data[table], error: null });
          promise.eq = (field: string, value: any) => {
            const records = data[table].filter((r: any) => r[field] === value);
            const eqPromise: any = makeThenable({ data: records, error: null });
            eqPromise.single = () => Promise.resolve({ data: records[0] || null, error: null });
            return eqPromise;
          };
          promise.single = () => Promise.resolve({ data: data[table][0] || null, error: null });
          return promise;
        },
        insert: (values: any) => {
          const arr = Array.isArray(values) ? values : [values];
          const inserted = arr.map(v => ({ id: Date.now(), ...v }));
          data[table].push(...inserted);
          const promise: any = makeThenable({ data: inserted, error: null });
          promise.single = () => Promise.resolve({ data: inserted[0], error: null });
          return { select: () => promise };
        },
        update: (values: any) => ({
          eq: (field: string, value: any) => {
            const doUpdate = () => {
              const idx = data[table].findIndex((r: any) => r[field] === value);
              if (idx !== -1) data[table][idx] = { ...data[table][idx], ...values };
              return { data: data[table][idx] || null, error: null };
            };
            const promise: any = makeThenable(doUpdate());
            promise.select = () => {
              const p: any = makeThenable(doUpdate());
              p.single = () => Promise.resolve(doUpdate());
              return p;
            };
            return promise;
          }
        }),
        delete: () => ({
          eq: (field: string, value: any) => ({
            select: () => ({
              single: () => {
                const idx = data[table].findIndex((r: any) => r[field] === value);
                const removed = idx !== -1 ? data[table].splice(idx, 1)[0] : null;
                return Promise.resolve({ data: removed, error: null });
              }
            })
          })
        })
      })
    })
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

describe('Analytics endpoints', () => {
  it('returns team standings', async () => {
    const res = await request(app).get('/api/analytics/standings');
    expect(res.status).toBe(200);
    expect(res.body[0].team).toBe('Alpha');
    expect(res.body[0].rank).toBe(1);
    expect(res.body).toHaveLength(2);
  });

  it('returns speaker averages', async () => {
    data.scores.push({ id: 3, room: 'A1', speaker: 'B1', team: 'Bravo', total: 55 });
    const res = await request(app).get('/api/analytics/speakers');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('A1');
    expect(res.body[1].name).toBe('B1');
    expect(res.body[1].average).toBeCloseTo(60);
  });

  it('aggregates performance by round', async () => {
    data.pairings.push({ id: 2, round: 2, room: 'B1', proposition: 'Alpha', opposition: 'Bravo', judge: 'J1', status: 'completed', propWins: false });
    data.scores.push({ id: 3, room: 'B1', speaker: 'A1', team: 'Alpha', total: 72 });
    const res = await request(app).get('/api/analytics/performance');
    expect(res.status).toBe(200);
    const r1 = res.body.find((r: any) => r.round === 'R1');
    const r2 = res.body.find((r: any) => r.round === 'R2');
    expect(r1.avgScore).toBe(70);
    expect(r2.avgScore).toBe(72);
  });
});
