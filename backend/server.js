import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001
let tasks = [{ id: 1, title: 'Automatizzare il deploy', completed: false }]

app.use(cors())
app.use(express.json())
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.get('/api/tasks', (_request, response) => response.json(tasks))
app.post('/api/tasks', (request, response) => {
  const title = request.body?.title?.trim()
  if (!title) return response.status(400).json({ error: 'title obbligatorio' })
  const task = { id: Date.now(), title, completed: false }
  tasks.push(task)
  return response.status(201).json(task)
})

app.listen(port, () => console.log(`API in ascolto sulla porta ${port}`))
