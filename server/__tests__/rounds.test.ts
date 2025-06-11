/**
 * @jest-environment node
 */
import request from 'supertest'
import type { Express } from 'express'
import { jest } from '@jest/globals'
// @ts-expect-error - provided by Jest mock
import { __setMockData } from '@supabase/supabase-js'

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

// Mock Supabase client so our server code uses in-memory data
jest.mock('@supabase/supabase-js', () => {
  const makeThenable = (result: any) => ({
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej)
  })

  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => {
          const promise: any = makeThenable({ data: data[table], error: null })
          promise.eq = (field: string, value: any) => {
            const filtered = data[table].filter((row: any) => row[field] === value)
            const eqPromise: any = makeThenable({ data: filtered, error: null })
            eqPromise.single = () =>
              Promise.resolve({ data: filtered[0] ?? null, error: null })
            return eqPromise
          }
          promise.single = () =>
            Promise.resolve({ data: data[table][0] ?? null, error: null })
          return promise
        },
        insert: (vals: any) => {
          const arr = Array.isArray(vals) ? vals : [vals]
          const inserted = arr.map(v => ({ id: Date.now(), ...v }))
          data[table].push(...inserted)
          const promise: any = makeThenable({ data: inserted, error: null })
          promise.single = () => Promise.resolve({ data: inserted[0], error: null })
          return { select: () => promise }
        },
        update: (vals: any) => ({
          eq: (field: string, value: any) => {
            const apply = () => {
              const idx = data[table].findIndex((r: any) => r[field] === value)
              if (idx !== -1) data[table][idx] = { ...data[table][idx], ...vals }
              return { data: data[table][idx] ?? null, error: null }
            }
            const promise: any = makeThenable(apply())
            promise.select = () => {
              const p: any = makeThenable(apply())
              p.single = () => Promise.resolve(apply())
              return p
            }
            return promise
          }
        }),
        delete: () => ({
          eq: (field: string, value: any) => ({
            select: () => ({
              single: () => {
                const idx = data[table].findIndex((r: any) => r[field] === value)
                const removed = idx !== -1 ? data[table].splice(idx, 1)[0] : null
                return Promise.resolve({ data: removed, error: null })
              }
            })
          })
        })
      })
    })
  }
})

let app: Express

beforeAll(async () => {
  // Ensure mock env is applied before importing the server
  process.env.SUPABASE_URL = 'http://localhost'
  process.env.SUPABASE_ANON_KEY = 'testkey'
  const mod = await import('../server')
  app = mod.default as Express
})

beforeEach(() => {
  // Reset our in‐memory dataset and supply it to the mock
  data = JSON.parse(JSON.stringify(seed))
  __setMockData(data)
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

    const res = await request(app).post('/api/rounds/progress')
    expect(res.status).toBe(200)
    // Response returns the new round
    expect(res.body.currentRound).toBe(2)
    // And our in-memory settings reflect that
    expect(data.settings[0].currentRound).toBe(2)
  })
})
