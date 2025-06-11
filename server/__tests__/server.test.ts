/**
 * @jest-environment node
 */
import request from 'supertest'
import type { Express } from 'express'
import { jest } from '@jest/globals'
// @ts-expect-error - provided by Jest mock
import { __setMockData } from '@supabase/supabase-js'

const seed = {
  tournaments: [
    { id: 't1', name: 'Test Tournament', format: 'swiss', status: 'active' }
  ],
  teams: [
    { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'], tournament_id: 't1' }
  ],
  speakers: [
    { id: 's1', team_id: 1, name: 'A1', position: 1 }
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
}
let data: any = JSON.parse(JSON.stringify(seed))

jest.mock('@supabase/supabase-js', () => {
  const makeThenable = (result: any) => ({
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej),
  })

  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => {
          const promise: any = makeThenable({ data: data[table], error: null })
          promise.eq = (field: string, value: any) => {
            const filtered = data[table].filter((r: any) => r[field] === value)
            const eqPromise: any = makeThenable({ data: filtered, error: null })
            eqPromise.single = () => Promise.resolve({ data: filtered[0] || null, error: null })
            return eqPromise
          }
          promise.single = () => Promise.resolve({ data: data[table][0] || null, error: null })
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
            const doUpdate = () => {
              const idx = data[table].findIndex((r: any) => r[field] === value)
              if (idx !== -1) data[table][idx] = { ...data[table][idx], ...vals }
              return { data: data[table][idx] || null, error: null }
            }
            const promise: any = makeThenable(doUpdate())
            promise.select = () => {
              const p: any = makeThenable(doUpdate())
              p.single = () => Promise.resolve(doUpdate())
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
  jest.resetModules()
  process.env.SUPABASE_URL = 'http://localhost'
  process.env.SUPABASE_ANON_KEY = 'testkey'
  const mod = await import('../server')
  app = mod.default as Express
})

beforeEach(() => {
  data = JSON.parse(JSON.stringify(seed))
  __setMockData(data)
})

describe('Core API Endpoints', () => {
  it('GET /api/teams should return all teams', async () => {
    const res = await request(app).get('/api/teams')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('name')
  })

  it('POST /api/teams should create a team with tournament_id', async () => {
    const team = {
      name: 'Bravo',
      organization: 'Org',
      speakers: ['B1'],
      tournament_id: 't1'
    }
    const res = await request(app).post('/api/teams').send(team)
    expect(res.status).toBe(201)
    expect(res.body.name).toBe(team.name)
    expect(res.body.tournament_id).toBe('t1')
  })

  it('GET /api/teams?tournament_id should filter teams', async () => {
    const res = await request(app).get('/api/teams').query({ tournament_id: 't1' })
    expect(res.status).toBe(200)
    expect(res.body.every((t: any) => t.tournament_id === 't1')).toBe(true)
  })

  it('GET /api/speakers?team_id should filter speakers', async () => {
    const res = await request(app).get('/api/speakers').query({ team_id: 1 })
    expect(res.status).toBe(200)
    expect(res.body.every((s: any) => s.team_id === 1)).toBe(true)
  })

  it('GET /api/pairings should return pairings and currentRound', async () => {
    const res = await request(app).get('/api/pairings')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('pairings')
    expect(Array.isArray(res.body.pairings)).toBe(true)
    expect(res.body).toHaveProperty('currentRound')
  })

  it('POST /api/bracket should generate a bracket', async () => {
    const res = await request(app).post('/api/bracket').send({ type: 'single' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('GET /api/scores/:room should return scores', async () => {
    const res = await request(app).get('/api/scores/A1')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('PUT /api/tournaments/:id should persist status and settings', async () => {
    const res = await request(app)
      .put('/api/tournaments/t1')
      .send({ status: 'completed', settings: { rounds: 5, elimination: 'double' } })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('completed')
    expect(res.body.settings).toEqual({ rounds: 5, elimination: 'double' })
  })
})

describe('Users CRUD', () => {
  it('GET /api/users should return an array', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/users should create a user', async () => {
    const user = { name: 'John Doe', email: 'john@example.com', role: 'Judge' }
    const res = await request(app).post('/api/users').send(user)
    expect(res.status).toBe(201)
    expect(res.body.name).toBe(user.name)
  })

  it('PUT /api/users/:id should update a user', async () => {
    const create = await request(app)
      .post('/api/users')
      .send({ name: 'Jane', email: 'jane@example.com', role: 'Judge' })
    const res = await request(app).put(`/api/users/${create.body.id}`).send({ name: 'Jane Updated' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Jane Updated')
  })

  it('DELETE /api/users/:id should remove a user', async () => {
    const create = await request(app)
      .post('/api/users')
      .send({ name: 'Temp', email: 'temp@example.com', role: 'Judge' })
    const res = await request(app).delete(`/api/users/${create.body.id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(create.body.id)
  })
})
