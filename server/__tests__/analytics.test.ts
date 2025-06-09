/** @jest-environment node */
import request from 'supertest';
import type { Express } from 'express';
// @ts-expect-error - provided by Jest mock
import { __setMockData } from '@supabase/supabase-js';

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
