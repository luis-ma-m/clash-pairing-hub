/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
import { createClient } from '@supabase/supabase-js';
import { jest } from '@jest/globals';

const seed = {
  teams: [
    { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'] },
    { id: 2, name: 'Bravo', organization: 'Org', speakers: ['B1'] },
    { id: 3, name: 'Charlie', organization: 'Org', speakers: ['C1'] }
  ],
  pairings: [],
  scores: [],
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
          return {
            select: () => Promise.resolve({ data: inserted, error: null })
          };
        },
        update: (values: any) => ({
          eq: (field: string, value: any) => {
            const doUpdate = () => {
              const idx = data[table].findIndex((r: any) => r[field] === value);
              if (idx !== -1) data[table][idx] = { ...data[table][idx], ...values };
              return { data: data[table][idx] || null, error: null };
            };
            const promise: any = makeThenable(doUpdate());
            promise.select = () => ({ single: () => Promise.resolve(doUpdate()) });
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

describe('Swiss pairing rounds', () => {
  it('handles odd team counts and updates current round', async () => {
    const res = await request(app).post('/api/pairings/swiss').send({ round: 2 });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(data.settings[0].currentRound).toBe(2);
  });
});
