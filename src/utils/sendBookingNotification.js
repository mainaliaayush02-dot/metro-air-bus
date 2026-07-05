import emailjs from '@emailjs/browser'
import { COMPANY_CONFIG } from '../config/constants'
import { formatDualDate } from './adToBs'

// Emails the admin whenever a new booking is created. Never throws — a failed
// notification email must not block or roll back a real customer booking.
export async function sendBookingNotification(booking) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured — skipping booking notification email.')
    return
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: COMPANY_CONFIG.adminNotificationEmail,
        ticket_no: booking.ticketNo,
        passenger_name: booking.passengerName,
        passenger_phone: booking.passengerPhone,
        route: `${booking.from} to ${booking.to}`,
        journey_date: formatDualDate(booking.journeyDateAD),
        departure_time: booking.departureTime,
        boarding_point: booking.boardingPoint,
        seat_numbers: booking.seatNumbers?.join(', '),
        total_price: `Rs. ${booking.totalPrice}`,
        promo_code: booking.promoCode || 'None',
      },
      { publicKey }
    )
  } catch (err) {
    console.error('Failed to send booking notification email:', err)
  }
}
