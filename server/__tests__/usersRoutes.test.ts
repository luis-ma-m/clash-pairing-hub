/**
 * @jest-environment node
 */
import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'

jest.mock('@supabase/supabase-js', () => {
  const makeThenable = (result: any) => ({
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej)
  })
  return {
    __esModule: true,
    createClient: () => ({
      auth: {
        getUser: (token: string) => makeThenable({ data: { user: { id: 'admin' } }, error: null })
      },
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
        update: (vals: any) => ({
          eq: (f: string, v: any) => {
            const idx = data[table].findIndex((r: any) => r[f] === v)
            if (idx !== -1) data[table][idx] = { ...data[table][idx], ...vals }
            return { select: () => ({ single: () => Promise.resolve({ data: data[table][idx], error: null }) }) }
          }
        })
      })
    })
  }
})

import usersRouter from '../routes/users'

let __setMockData: (d: any) => void

const seed = {
  users: [
    { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'user', is_active: true }
  ]
}
let data: any = JSON.parse(JSON.stringify(seed))
__setMockData = (d: any) => { data = d }

describe('usersRouter', () => {
  let app: express.Express
  beforeAll(() => {
    process.env.SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc'
    app = express()
    app.use(express.json())
    app.use('/api/users', usersRouter)
  })
  beforeEach(() => { data = JSON.parse(JSON.stringify(seed)); __setMockData(data) })

  it('GET /api/users/u1 returns a user', async () => {
    const res = await request(app).get('/api/users/u1').set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('a@b.com')
  })
})
