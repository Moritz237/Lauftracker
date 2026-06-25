import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import pb from '../lib/pocketbase'
import { useFields } from '../hooks/useFields'

const TYPES = [
  { value: 'number', label: 'Zahl' },
  { value: 'distance', label: 'Distanz (xx,xx)' },
  { value: 'time_mmss', label: 'Zeit mm:ss' },
  { value: 'time_hmmss', label: 'Zeit h:mm:ss' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Auswahl' },
]

function SortableField({ field, onEdit, onArchive }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`field-row${field.archived ? ' archived' : ''}`}>
      <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
      <span className="field-row-name">{field.name}</span>
      <span className="field-row-type">{TYPES.find(t => t.value === field.type)?.label ?? field.type}</span>
      {field.unit && <span className="field-row-unit">{field.unit}</span>}
      <div className="field-row-actions">
        <button className="btn-ghost btn-sm" onClick={() => onEdit(field)}>Bearbeiten</button>
        <button className="btn-ghost btn-sm btn-danger" onClick={() => onArchive(field)}>
          {field.archived ? 'Reaktivieren' : 'Archivieren'}
        </button>
      </div>
    </div>
  )
}

const EMPTY_FORM = { name: '', type: 'number', unit: '', options: '' }

export default function Settings() {
  const { fields, loading, reload, setFields } = useFields({ includeArchived: true })
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = fields.findIndex(f => f.id === active.id)
    const newIdx = fields.findIndex(f => f.id === over.id)
    const reordered = arrayMove(fields, oldIdx, newIdx)
    setFields(reordered)

    await Promise.all(
      reordered.map((f, i) =>
        pb.collection('field_definitions').update(f.id, { sort_order: i })
      )
    )
  }

  function openNew() {
    setEditing('new')
    setForm(EMPTY_FORM)
  }

  function openEdit(field) {
    setEditing(field.id)
    setForm({
      name: field.name,
      type: field.type,
      unit: field.unit || '',
      options: Array.isArray(field.options) ? field.options.join('\n') : '',
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const data = {
      user: pb.authStore.model.id,
      name: form.name,
      type: form.type,
      unit: form.unit,
      options: form.type === 'select' ? form.options.split('\n').map(s => s.trim()).filter(Boolean) : [],
      sort_order: editing === 'new' ? fields.length : undefined,
    }
    try {
      if (editing === 'new') {
        await pb.collection('field_definitions').create(data)
      } else {
        await pb.collection('field_definitions').update(editing, data)
      }
      setEditing(null)
      reload()
    } catch (err) {
      alert('Fehler: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(field) {
    await pb.collection('field_definitions').update(field.id, { archived: !field.archived })
    reload()
  }

  if (loading) return <div className="page-loading">Lade Felder…</div>

  if (editing !== null) {
    return (
      <form className="settings-form" onSubmit={handleSave}>
        <h2>{editing === 'new' ? 'Neues Feld' : 'Feld bearbeiten'}</h2>

        <label>
          Name
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </label>

        <label>
          Typ
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label>
          Einheit (optional)
          <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="z.B. km, bpm" />
        </label>

        {form.type === 'select' && (
          <label>
            Optionen (eine pro Zeile)
            <textarea
              value={form.options}
              onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
              rows={4}
              placeholder={'Leicht\nMittel\nSchwer'}
            />
          </label>
        )}

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Abbrechen</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </form>
    )
  }

  const activeFields = fields.filter(f => !f.archived)
  const archivedFields = fields.filter(f => f.archived)

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Felder</h2>
        <button className="btn-primary btn-sm" onClick={openNew}>+ Neues Feld</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {activeFields.map(field => (
            <SortableField key={field.id} field={field} onEdit={openEdit} onArchive={handleArchive} />
          ))}
        </SortableContext>
      </DndContext>

      {activeFields.length === 0 && (
        <p className="empty-hint">Noch keine Felder. Klicke auf „+ Neues Feld".</p>
      )}

      {archivedFields.length > 0 && (
        <>
          <h3 className="archived-heading">Archiviert</h3>
          {archivedFields.map(field => (
            <SortableField key={field.id} field={field} onEdit={openEdit} onArchive={handleArchive} />
          ))}
        </>
      )}
    </div>
  )
}
