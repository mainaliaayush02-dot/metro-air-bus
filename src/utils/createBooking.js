import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateTicketNo } from './generateTicketNo'
import { adToBS } from './adToBs'
import { sendBookingNotification } from './sendBookingNotification'

export async function createBooking({
  scheduleId,
  schedule,
  seatNumbers,
  passengerName,
  passengerPhone,
  boardingPoint,
  droppingPoint,
  uid,
  promoCode = null,
  discountPerSeat = 0,
}) {
  const bookingRef = doc(collection(db, 'bookings'))
  const scheduleRef = doc(db, 'schedules', scheduleId)
  const seatRefs = seatNumbers.map((seatId) => doc(db, 'schedules', scheduleId, 'seats', seatId))

  const todayAD = new Date().toISOString().slice(0, 10)
  const ticketNo = generateTicketNo(schedule.departureDateAD)
  const rate = schedule.basePrice
  const discount = discountPerSeat * seatNumbers.length
  const totalPrice = rate * seatNumbers.length - discount

  await runTransaction(db, async (transaction) => {
    const seatSnaps = await Promise.all(seatRefs.map((ref) => transaction.get(ref)))
    const scheduleSnap = await transaction.get(scheduleRef)

    for (let i = 0; i < seatSnaps.length; i++) {
      if (!seatSnaps[i].exists() || seatSnaps[i].data().status !== 'available') {
        throw new Error(`Seat ${seatNumbers[i]} is no longer available. Please choose another seat.`)
      }
    }

    seatRefs.forEach((ref) => {
      transaction.update(ref, {
        status: 'booked',
        bookedBy: uid,
        bookingId: bookingRef.id,
        updatedAt: serverTimestamp(),
      })
    })

    transaction.set(bookingRef, {
      ticketNo,
      scheduleId,
      passengerId: uid,
      passengerName,
      passengerPhone,
      from: schedule.from,
      to: schedule.to,
      boardingPoint,
      droppingPoint,
      seatNumbers,
      journeyDateAD: schedule.departureDateAD,
      journeyDateBS: schedule.departureDateBS,
      bookingDateAD: todayAD,
      bookingDateBS: adToBS(todayAD),
      departureTime: schedule.departureTime,
      rate,
      discount,
      promoCode,
      totalPrice,
      status: 'confirmed',
      createdAt: serverTimestamp(),
    })

    transaction.update(scheduleRef, {
      availableSeats: Math.max(0, (scheduleSnap.data().availableSeats || 0) - seatNumbers.length),
    })
  })

  sendBookingNotification({
    ticketNo,
    passengerName,
    passengerPhone,
    from: schedule.from,
    to: schedule.to,
    journeyDateAD: schedule.departureDateAD,
    departureTime: schedule.departureTime,
    boardingPoint,
    droppingPoint,
    seatNumbers,
    totalPrice,
    promoCode,
  })

  return bookingRef.id
}
