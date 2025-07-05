/**
 * @jest-environment node
 */
import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'
import { setMockData, createMockClient } from '../../test/localStorageSupabase'

jest.mock('@supabase/supabase-js', () => ({
  __esModule: true,
  createClient: () => createMockClient()
}))

import usersRouter from '../routes/users'

const seed = {
  users: [
    { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'user', is_active: true }
  ]
}
let data: any = JSON.parse(JSON.stringify(seed))

describe('usersRouter', () => {
  let app: express.Express
  beforeAll(() => {
    process.env.SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc'
    app = express()
    app.use(express.json())
    app.use('/api/users', usersRouter)
  })
  beforeEach(() => { data = JSON.parse(JSON.stringify(seed)); setMockData(data) })

  it('GET /api/users/u1 returns a user', async () => {
    const res = await request(app).get('/api/users/u1').set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('a@b.com')
  })
})
