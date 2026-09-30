import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SENTRY_TEST_ENABLED = import.meta.env.VITE_ENABLE_SENTRY_TEST === 'true'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('Caricamento…')

  async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/api/tasks`)
      if (!response.ok) throw new Error('Backend non disponibile')
      setTasks(await response.json())
      setStatus('Backend online')
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function addTask(event) {
    event.preventDefault()
    if (!title.trim()) return
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    })
    if (response.ok) { setTitle(''); await loadTasks() }
  }

  useEffect(() => { loadTasks() }, [])

  return (
    <main className="shell">
      <section className="hero"><span className="eyebrow">DEVOPS LAB</span><h1>Task Board</h1><p>Una piccola app full-stack per dimostrare un ciclo DevOps completo.</p></section>
      <section className="card"><div className="card-header"><h2>Attività del team</h2><span className="status">● {status}</span></div>
        {SENTRY_TEST_ENABLED && <button type="button" onClick={() => { throw new Error('Sentry test event') }}>Invia evento di test Sentry</button>}
        <form onSubmit={addTask}><input aria-label="Nuova attività" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Aggiungi un'attività…" /><button type="submit">Aggiungi</button></form>
        <ul>{tasks.map((task) => <li key={task.id}><span className="check">✓</span>{task.title}</li>)}</ul>
      </section>
    </main>
  )
}
