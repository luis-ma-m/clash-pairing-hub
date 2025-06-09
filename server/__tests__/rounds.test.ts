/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
// @ts-expect-error - provided by Jest mock
import { __setMockData } from '@supabase/supabase-js';

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

describe('Swiss pairing rounds', () => {
  it('handles odd team counts and updates current round', async () => {
    const res = await request(app).post('/api/pairings/swiss').send({ round: 2 });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(data.settings[0].currentRound).toBe(2);
  });
});

describe('Round progression', () => {
  it('does not progress if current round has incomplete pairings', async () => {
    data.pairings = [
      { id: 1, round: 1, room: 'R1', proposition: 'Alpha', opposition: 'Bravo', judge: 'J1', status: 'scheduled', propWins: null }
    ];
    const res = await request(app).post('/api/rounds/progress');
    expect(res.status).toBe(400);
    expect(data.settings[0].currentRound).toBe(1);
  });

  it('increments current round when all pairings completed', async () => {
    data.pairings = [
      { id: 1, round: 1, room: 'R1', proposition: 'Alpha', opposition: 'Bravo', judge: 'J1', status: 'completed', propWins: true }
    ];
    const res = await request(app).post('/api/rounds/progress');
    expect(res.status).toBe(200);
    expect(res.body.currentRound).toBe(2);
    expect(data.settings[0].currentRound).toBe(2);
  });
});
