// test/localStorageSupabase.ts
// Simple Supabase client mock backed by localStorage
/* eslint-disable @typescript-eslint/no-explicit-any */

export type MockDatabase = Record<string, any[]>

function getStore(): Storage {
  if (typeof localStorage !== 'undefined') return localStorage
  if (typeof window !== 'undefined' && (window as any).localStorage) return (window as any).localStorage
  let mem: Record<string, string> = {}
  return {
    getItem: (k: string) => (k in mem ? mem[k] : null),
    setItem: (k: string, v: string) => { mem[k] = v },
    removeItem: (k: string) => { delete mem[k] },
    clear: () => { mem = {} },
    key: (i: number) => Object.keys(mem)[i] ?? null,
    get length() { return Object.keys(mem).length }
  }
}

const KEY = 'supabaseData'

export function setMockData(data: MockDatabase) {
  const store = getStore()
  store.setItem(KEY, JSON.stringify(data))
}

export function getMockData(): MockDatabase {
  return readData()
}

function readData(): MockDatabase {
  const store = getStore()
  const raw = store.getItem(KEY)
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

function writeData(data: MockDatabase) {
  const store = getStore()
  store.setItem(KEY, JSON.stringify(data))
}

function makeThenable(result: any) {
  const promise = Promise.resolve(result)
  return {
    then: (res: any, rej: any) => promise.then(res, rej)
  }
}

export function createMockClient() {
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({}),
      signUp: () => Promise.resolve({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => makeThenable({ data: { user: { id: 'admin' } }, error: null })
    },
    from: (table: string) => ({
      select: () => {
        const db = readData()
        const list = db[table] || []
        const result = { data: list, error: null }
        const promise: any = makeThenable(result)
        promise.eq = (field: string, value: any) => {
          const records = list.filter(r => r[field] === value)
          const eqRes = { data: records, error: null }
          const eqPromise: any = makeThenable(eqRes)
          eqPromise.single = () => Promise.resolve({ data: records[0] || null, error: null })
          return eqPromise
        }
        promise.single = () => Promise.resolve({ data: list[0] || null, error: null })
        return promise
      },
      insert: (values: any) => {
        const arr = Array.isArray(values) ? values : [values]
        const inserted = arr.map(v => ({ id: Date.now(), ...v }))
        const db = readData()
        db[table] = (db[table] || []).concat(inserted)
        writeData(db)
        const result = { data: Array.isArray(values) ? inserted : inserted[0], error: null }
        return {
          select: () => {
            const promise: any = makeThenable(result)
            promise.single = () => Promise.resolve(result)
            return promise
          }
        }
      },
      update: (vals: any) => ({
        eq: (field: string, value: any) => {
          const db = readData()
          const list = db[table] || []
          const idx = list.findIndex(r => r[field] === value)
          if (idx !== -1) list[idx] = { ...list[idx], ...vals }
          db[table] = list
          writeData(db)
          const updated = { data: list[idx] || null, error: null }
          const promise: any = makeThenable(updated)
          promise.select = () => ({ single: () => Promise.resolve(updated) })
          return promise
        }
      }),
      delete: () => ({
        eq: (field: string, value: any) => ({
          select: () => ({
            single: () => {
              const db = readData()
              const list = db[table] || []
              const idx = list.findIndex(r => r[field] === value)
              const removed = idx !== -1 ? list.splice(idx, 1)[0] : null
              db[table] = list
              writeData(db)
              return Promise.resolve({ data: removed, error: null })
            }
          })
        })
      })
    })
  }
}

export function createClient() {
  return createMockClient()
}

export default { createClient }

