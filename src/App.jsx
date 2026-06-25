import { useState, useEffect } from 'react'
import pb from './lib/pocketbase'
import Login from './pages/Login'
import RunForm from './pages/RunForm'
import History from './pages/History'
import Settings from './pages/Settings'
import './App.css'

export default function App() {
  const [user, setUser] = useState(pb.authStore.model)
  const [tab, setTab] = useState('form')

  useEffect(() => {
    return pb.authStore.onChange((_, model) => setUser(model))
  }, [])

  if (!user) return <Login onLogin={setUser} />

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">Lauftracker</span>
        <button className="btn-ghost" onClick={() => { pb.authStore.clear(); setUser(null) }}>
          Abmelden
        </button>
      </header>

      <main className="app-main">
        {tab === 'form' && <RunForm />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <Settings />}
      </main>

      <nav className="app-nav">
        <button className={tab === 'form' ? 'active' : ''} onClick={() => setTab('form')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Eintragen
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Verlauf
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
          Felder
        </button>
      </nav>
    </div>
  )
}
