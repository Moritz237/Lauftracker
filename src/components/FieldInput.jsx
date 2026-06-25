import { useRef } from 'react'

export default function FieldInput({ field, value, onChange, onAdvance }) {
  const ref = useRef(null)

  function handleDistanceInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(raw)
    if (raw.length === 4) onAdvance?.()
  }

  function handleTimeMmss(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(raw)
    if (raw.length === 4) onAdvance?.()
  }

  function handleTimeHmmss(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 5)
    onChange(raw)
    if (raw.length === 5) onAdvance?.()
  }

  function displayDistance(raw = '') {
    const digits = raw.replace(/\D/g, '').padStart(4, '0')
    return `${digits.slice(0, 2)},${digits.slice(2)}`
  }

  function displayMmss(raw = '') {
    const digits = raw.replace(/\D/g, '').padStart(4, '0')
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }

  function displayHmmss(raw = '') {
    const digits = raw.replace(/\D/g, '').padStart(5, '0')
    return `${digits[0]}:${digits.slice(1, 3)}:${digits.slice(3)}`
  }

  const commonProps = {
    ref,
    id: `field-${field.id}`,
    className: 'field-input',
  }

  if (field.type === 'number') {
    return (
      <input
        {...commonProps}
        type="text"
        inputMode="decimal"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
      />
    )
  }

  if (field.type === 'distance') {
    const raw = (value || '').replace(/\D/g, '')
    const display = raw.length > 0 ? displayDistance(raw) : ''
    return (
      <input
        {...commonProps}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleDistanceInput}
        placeholder="00,00"
      />
    )
  }

  if (field.type === 'time_mmss') {
    const raw = (value || '').replace(/\D/g, '')
    const display = raw.length > 0 ? displayMmss(raw) : ''
    return (
      <input
        {...commonProps}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleTimeMmss}
        placeholder="00:00"
      />
    )
  }

  if (field.type === 'time_hmmss') {
    const raw = (value || '').replace(/\D/g, '')
    const display = raw.length > 0 ? displayHmmss(raw) : ''
    return (
      <input
        {...commonProps}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleTimeHmmss}
        placeholder="0:00:00"
      />
    )
  }

  if (field.type === 'text') {
    return (
      <input
        {...commonProps}
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder=""
      />
    )
  }

  if (field.type === 'select') {
    const options = Array.isArray(field.options) ? field.options : []
    return (
      <div className="select-buttons">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`select-btn${value === opt ? ' active' : ''}`}
            onClick={() => { onChange(opt); onAdvance?.() }}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  return null
}
