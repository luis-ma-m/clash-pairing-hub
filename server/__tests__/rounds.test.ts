/**
 * @jest-environment node
 */
import request from 'supertest'
import type { Express } from 'express'
import { jest } from '@jest/globals'
// @ts-expect-error - provided by Jest mock
import { setMockData, getMockData } from '../../test/localStorageSupabase'

const seed = {
  teams: [
    { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'], tournament_id: 't1' },
    { id: 2, name: 'Bravo', organization: 'Org', speakers: ['B1'], tournament_id: 't1' },
    { id: 3, name: 'Charlie', organization: 'Org', speakers: ['C1'], tournament_id: 't1' }
  ],
  pairings: [],
  scores: [],
  settings: [
    { id: 1, currentRound: 1 }
  ],
  debates: [],
  users: [],
  brackets: []
}

let data: Record<string, any> = JSON.parse(JSON.stringify(seed))

// Supabase client requests are resolved to the localStorage mock via Jest config

let app: Express

beforeAll(async () => {
  // Ensure mock env is applied before importing the server
  process.env.SUPABASE_URL = 'http://localhost'
  process.env.SUPABASE_ANON_KEY = 'testkey'
  const mod = await import('../server')
  app = mod.default as Express
})

beforeEach(() => {
  // Reset our in-memory dataset and supply it to the mock
  data = JSON.parse(JSON.stringify(seed))
  setMockData(data)
})

describe('Swiss pairing rounds', () => {
  it('handles odd team counts and updates current round', async () => {
    const res = await request(app)
      .post('/api/pairings/swiss')
      .send({ round: 2, tournament_id: 't1' })

    expect(res.status).toBe(201)
    expect(Array.isArray(res.body)).toBe(true)
    // With 3 teams, Swiss will generate one pairing and leave one bye
    expect(res.body.length).toBe(1)
    // After running, the settings.currentRound should advance to 2
    data = getMockData()
    expect(data.settings[0].currentRound).toBe(2)
  })
})

describe('Round progression', () => {
  it('does not progress if current round has incomplete pairings', async () => {
    data.pairings = [
      {
        id: 1,
        round: 1,
        room: 'R1',
        proposition: 'Alpha',
        opposition: 'Bravo',
        judge: 'J1',
        status: 'scheduled',
        propWins: null,
        tournament_id: 't1'
      }
    ]
    setMockData(data)

    const res = await request(app).post('/api/rounds/progress')
    expect(res.status).toBe(400)
    // currentRound remains unchanged
    expect(data.settings[0].currentRound).toBe(1)
  })

  it('increments current round when all pairings completed', async () => {
    data.pairings = [
      {
        id: 1,
        round: 1,
        room: 'R1',
        proposition: 'Alpha',
        opposition: 'Bravo',
        judge: 'J1',
        status: 'completed',
        propWins: true,
        tournament_id: 't1'
      }
    ]
    setMockData(data)

    const res = await request(app).post('/api/rounds/progress')
    expect(res.status).toBe(200)
    // Response returns the new round
    expect(res.body.currentRound).toBe(2)
    // And our in-memory settings reflect that
    data = getMockData()
    expect(data.settings[0].currentRound).toBe(2)
  })
})
