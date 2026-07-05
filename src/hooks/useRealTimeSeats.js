import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useRealTimeSeats(scheduleId) {
  const [seats, setSeats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!scheduleId) return

    const seatsRef = collection(db, 'schedules', scheduleId, 'seats')
    const unsub = onSnapshot(seatsRef, (snapshot) => {
      const seatMap = {}
      snapshot.docs.forEach((doc) => {
        seatMap[doc.id] = doc.data()
      })
      setSeats(seatMap)
      setLoading(false)
    })

    return () => unsub()
  }, [scheduleId])

  return { seats, loading }
}
