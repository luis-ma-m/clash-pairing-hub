import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('./server/db.json')
const db = new Low(adapter, { teams: [], pairings: [], debates: [], scores: [], users: [] })

export async function initDB() {
  await db.read()
  db.data ||= { teams: [], pairings: [], debates: [], scores: [], users: [] }
  await db.write()
  return db
}

export default db
