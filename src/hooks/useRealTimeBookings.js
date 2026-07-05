import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useRealTimeBookings(uid) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'bookings'),
      where('passengerId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

    return () => unsub()
  }, [uid])

  return { bookings, loading }
}
