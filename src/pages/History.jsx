import { useState, useEffect } from 'react'
import pb from '../lib/pocketbase'
import { useFields } from '../hooks/useFields'

function formatValue(val, field) {
  if (val == null || val === '') return '—'
  const raw = String(val).replace(/\D/g, '')
  if (field.type === 'distance') {
    if (!raw) return val
    const padded = raw.padStart(4, '0')
    return `${padded.slice(0, 2)},${padded.slice(2)}`
  }
  if (field.type === 'time_mmss') {
    if (!raw) return val
    const padded = raw.padStart(4, '0')
    return `${padded.slice(0, 2)}:${padded.slice(2)}`
  }
  if (field.type === 'time_hmmss') {
    if (!raw) return val
    const padded = raw.padStart(5, '0')
    return `${padded[0]}:${padded.slice(1, 3)}:${padded.slice(3)}`
  }
  return val
}

export default function History() {
  const { fields, loading: fieldsLoading } = useFields()
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('runs').getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
      sort: '-date,-created',
    }).then(r => { setRuns(r); setLoading(false) })
  }, [])

  if (fieldsLoading || loading) return <div className="page-loading">Lade Läufe…</div>
  if (runs.length === 0) return <div className="empty-state"><p>Noch kein Lauf eingetragen.</p></div>

  return (
    <div className="history-page">
      <div className="table-scroll">
        <table className="history-table">
          <thead>
            <tr>
              <th>Datum</th>
              {fields.map(f => (
                <th key={f.id}>{f.name}{f.unit ? ` (${f.unit})` : ''}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id}>
                <td>{run.date}</td>
                {fields.map(f => (
                  <td key={f.id}>{formatValue(run.values?.[f.id], f)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
