import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useSchedules({ from, to, date } = {}) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!from || !to || !date) {
      setSchedules([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'schedules'),
      where('from', '==', from),
      where('to', '==', to),
      where('departureDateAD', '==', date),
      where('status', '==', 'scheduled')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      setSchedules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

    return () => unsub()
  }, [from, to, date])

  return { schedules, loading }
}
