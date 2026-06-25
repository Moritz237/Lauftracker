import { useState, useRef } from 'react'
import pb from '../lib/pocketbase'
import { useFields } from '../hooks/useFields'
import FieldInput from '../components/FieldInput'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function RunForm() {
  const { fields, loading } = useFields()
  const [date, setDate] = useState(today())
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRefs = useRef({})

  function setValue(id, val) {
    setValues(v => ({ ...v, [id]: val }))
  }

  function advanceTo(currentIdx) {
    const next = fields[currentIdx + 1]
    if (!next) return
    const el = inputRefs.current[next.id]
    if (el) el.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await pb.collection('runs').create({
        user: pb.authStore.model.id,
        date,
        values,
      })
      setValues({})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-loading">Lade Felder…</div>
  if (fields.length === 0) {
    return (
      <div className="empty-state">
        <p>Noch keine Felder angelegt.</p>
        <p>Gehe zu <strong>Felder</strong>, um dein erstes Feld zu erstellen.</p>
      </div>
    )
  }

  return (
    <form className="run-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="run-date">Datum</label>
        <input
          id="run-date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="field-input"
        />
      </div>

      {fields.map((field, idx) => (
        <div key={field.id} className="form-field">
          <label htmlFor={`field-${field.id}`}>
            {field.name}
            {field.unit && <span className="unit"> ({field.unit})</span>}
          </label>
          <div ref={el => { if (el) inputRefs.current[field.id] = el.querySelector('input, .select-buttons') }}>
            <FieldInput
              field={field}
              value={values[field.id] ?? ''}
              onChange={val => setValue(field.id, val)}
              onAdvance={() => advanceTo(idx)}
            />
          </div>
        </div>
      ))}

      <button type="submit" className="btn-primary btn-full" disabled={saving}>
        {saved ? 'Gespeichert!' : saving ? 'Speichern…' : 'Lauf speichern'}
      </button>
    </form>
  )
}
