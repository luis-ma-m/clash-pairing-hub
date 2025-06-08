import express from 'express'
import cors from 'cors'
import db, { initDB } from './db.js'

await initDB()

const app = express()
app.use(cors())
app.use(express.json())

// Helper to save DB after mutation
const save = () => db.write()

// Teams CRUD
app.get('/api/teams', async (_req, res) => {
  await db.read()
  res.json(db.data.teams)
})

app.get('/api/teams/:id', async (req, res) => {
  await db.read()
  const team = db.data.teams.find(t => t.id === Number(req.params.id))
  if (!team) return res.status(404).json({ error: 'Not found' })
  res.json(team)
})

app.post('/api/teams', async (req, res) => {
  const team = { id: Date.now(), wins: 0, losses: 0, speakerPoints: 0, ...req.body }
  db.data.teams.push(team)
  await save()
  res.status(201).json(team)
})

app.put('/api/teams/:id', async (req, res) => {
  const idx = db.data.teams.findIndex(t => t.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.teams[idx] = { ...db.data.teams[idx], ...req.body }
  await save()
  res.json(db.data.teams[idx])
})

app.delete('/api/teams/:id', async (req, res) => {
  const idx = db.data.teams.findIndex(t => t.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const removed = db.data.teams.splice(idx, 1)
  await save()
  res.json(removed[0])
})

// Pairings CRUD
app.get('/api/pairings', async (_req, res) => {
  await db.read()
  res.json(db.data.pairings)
})

app.get('/api/pairings/:id', async (req, res) => {
  await db.read()
  const pairing = db.data.pairings.find(p => p.id === Number(req.params.id))
  if (!pairing) return res.status(404).json({ error: 'Not found' })
  res.json(pairing)
})

app.post('/api/pairings', async (req, res) => {
  const pairing = { id: Date.now(), ...req.body }
  db.data.pairings.push(pairing)
  await save()
  res.status(201).json(pairing)
})

app.put('/api/pairings/:id', async (req, res) => {
  const idx = db.data.pairings.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.pairings[idx] = { ...db.data.pairings[idx], ...req.body }
  await save()
  res.json(db.data.pairings[idx])
})

app.delete('/api/pairings/:id', async (req, res) => {
  const idx = db.data.pairings.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const removed = db.data.pairings.splice(idx, 1)
  await save()
  res.json(removed[0])
})

// Generate pairings - simplistic
app.post('/api/pairings/generate', async (_req, res) => {
  await db.read()
  const teams = [...db.data.teams]
  const newPairings = []
  for (let i = 0; i < teams.length; i += 2) {
    const prop = teams[i]
    const opp = teams[i + 1]
    if (!opp) break
    newPairings.push({
      id: Date.now() + i,
      room: `Room ${i / 2 + 1}`,
      proposition: prop.name,
      opposition: opp.name,
      judge: '',
      status: 'upcoming',
      propWins: null
    })
  }
  db.data.pairings.push(...newPairings)
  await save()
  res.json(newPairings)
})

// Debates CRUD
app.get('/api/debates', async (_req, res) => {
  await db.read()
  res.json(db.data.debates)
})

app.get('/api/debates/:id', async (req, res) => {
  await db.read()
  const debate = db.data.debates.find(d => d.id === Number(req.params.id))
  if (!debate) return res.status(404).json({ error: 'Not found' })
  res.json(debate)
})

app.post('/api/debates', async (req, res) => {
  const debate = { id: Date.now(), ...req.body }
  db.data.debates.push(debate)
  await save()
  res.status(201).json(debate)
})

app.put('/api/debates/:id', async (req, res) => {
  const idx = db.data.debates.findIndex(d => d.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.debates[idx] = { ...db.data.debates[idx], ...req.body }
  await save()
  res.json(db.data.debates[idx])
})

app.delete('/api/debates/:id', async (req, res) => {
  const idx = db.data.debates.findIndex(d => d.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const removed = db.data.debates.splice(idx, 1)
  await save()
  res.json(removed[0])
})

// Scores CRUD
app.get('/api/scores', async (_req, res) => {
  await db.read()
  res.json(db.data.scores)
})

app.get('/api/scores/:room', async (req, res) => {
  await db.read()
  const scores = db.data.scores.filter(s => s.room === req.params.room)
  res.json(scores)
})

app.post('/api/scores', async (req, res) => {
  const score = { id: Date.now(), ...req.body }
  db.data.scores.push(score)
  await save()
  res.status(201).json(score)
})

app.put('/api/scores/:id', async (req, res) => {
  const idx = db.data.scores.findIndex(s => s.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.scores[idx] = { ...db.data.scores[idx], ...req.body }
  await save()
  res.json(db.data.scores[idx])
})

app.delete('/api/scores/:id', async (req, res) => {
  const idx = db.data.scores.findIndex(s => s.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const removed = db.data.scores.splice(idx, 1)
  await save()
  res.json(removed[0])
})

// Submit team and speaker scores
app.post('/api/scores/team', async (req, res) => {
  const entry = { id: Date.now(), type: 'team', ...req.body }
  db.data.scores.push(entry)
  await save()
  res.status(201).json(entry)
})

app.post('/api/scores/speaker', async (req, res) => {
  const entry = { id: Date.now(), type: 'speaker', ...req.body }
  db.data.scores.push(entry)
  await save()
  res.status(201).json(entry)
})

// Users CRUD
app.get('/api/users', async (_req, res) => {
  await db.read()
  res.json(db.data.users)
})

app.get('/api/users/:id', async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === Number(req.params.id))
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(user)
})

app.post('/api/users', async (req, res) => {
  const user = { id: Date.now(), ...req.body }
  db.data.users.push(user)
  await save()
  res.status(201).json(user)
})

app.put('/api/users/:id', async (req, res) => {
  const idx = db.data.users.findIndex(u => u.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.users[idx] = { ...db.data.users[idx], ...req.body }
  await save()
  res.json(db.data.users[idx])
})

app.delete('/api/users/:id', async (req, res) => {
  const idx = db.data.users.findIndex(u => u.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const removed = db.data.users.splice(idx, 1)
  await save()
  res.json(removed[0])
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
