import 'dotenv/config'
import app from './server'
import usersRouter from './routes/users'

app.use('/api/users', usersRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
