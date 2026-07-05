import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function cancelBooking({ bookingId, scheduleId, seatNumbers, uid, isOperator = false }) {
  const bookingRef = doc(db, 'bookings', bookingId)
  const scheduleRef = doc(db, 'schedules', scheduleId)
  const seatRefs = seatNumbers.map((seatId) => doc(db, 'schedules', scheduleId, 'seats', seatId))

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef)
    const scheduleSnap = await transaction.get(scheduleRef)
    const seatSnaps = await Promise.all(seatRefs.map((ref) => transaction.get(ref)))

    if (!bookingSnap.exists()) throw new Error('Booking not found.')
    if (!isOperator && bookingSnap.data().passengerId !== uid) throw new Error('You are not authorized to cancel this booking.')
    if (bookingSnap.data().status !== 'confirmed') throw new Error('This booking cannot be cancelled.')

    transaction.update(bookingRef, { status: 'cancelled' })

    seatRefs.forEach((ref, i) => {
      const seatSnap = seatSnaps[i]
      if (seatSnap.exists() && (isOperator || seatSnap.data().bookedBy === uid)) {
        transaction.update(ref, {
          status: 'available',
          bookedBy: null,
          bookingId: null,
          updatedAt: serverTimestamp(),
        })
      }
    })

    transaction.update(scheduleRef, {
      availableSeats: (scheduleSnap.data().availableSeats || 0) + seatNumbers.length,
    })
  })
}
