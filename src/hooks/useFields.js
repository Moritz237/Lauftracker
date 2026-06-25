import { useState, useEffect } from 'react'
import pb from '../lib/pocketbase'

export function useFields({ includeArchived = false } = {}) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const filter = includeArchived ? `user = "${pb.authStore.model.id}"` : `user = "${pb.authStore.model.id}" && archived = false`
    const records = await pb.collection('field_definitions').getFullList({
      filter,
      sort: 'sort_order',
    })
    setFields(records)
    setLoading(false)
  }

  useEffect(() => { load() }, [includeArchived])

  return { fields, loading, reload: load, setFields }
}
