import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRealTimeBookings } from '../hooks/useRealTimeBookings'
import { canCancelBooking } from '../utils/bookingTime'
import { cancelBooking } from '../utils/cancelBooking'
import { formatDualDate } from '../utils/adToBs'
import SeoHead from '../seo/SeoHead'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Alert from '../components/ui/Alert'
import { COMPANY_CONFIG } from '../config/constants'

const STATUS_VARIANT = {
  confirmed: 'success',
  cancelled: 'danger',
  used: 'gray',
}

export default function MyBookings() {
  const { user } = useAuth()
  const { bookings, loading } = useRealTimeBookings(user?.uid)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    setError('')
    try {
      await cancelBooking({
        bookingId: cancelTarget.id,
        scheduleId: cancelTarget.scheduleId,
        seatNumbers: cancelTarget.seatNumbers,
        uid: user.uid,
      })
      setCancelTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SeoHead
        title={`My Bookings | ${COMPANY_CONFIG.name}`}
        description="View and manage your Metro Air Bus ticket bookings."
        keywords="Metro Air Bus my bookings, bus ticket history Nepal"
        canonical={`${COMPANY_CONFIG.domain}/my-bookings`}
      />

      <h1 className="text-2xl font-extrabold text-brand-black mb-6">My Bookings</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          You haven&apos;t booked any tickets yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-brand-black">{booking.ticketNo}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.from} → {booking.to}
                  </p>
                  <p className="text-xs text-gray-400">{formatDualDate(booking.journeyDateAD)} · {booking.departureTime}</p>
                </div>
                <Badge variant={STATUS_VARIANT[booking.status] || 'gray'}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {booking.seatNumbers?.map((s) => (
                  <span key={s} className="bg-gray-100 text-brand-black text-xs font-bold px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="font-bold text-brand-black">Rs. {booking.totalPrice}</p>
                <div className="flex gap-2">
                  <Button as={Link} to={`/ticket/${booking.id}`} variant="outline">
                    View Ticket
                  </Button>
                  {canCancelBooking(booking) && (
                    <Button variant="danger" onClick={() => setCancelTarget(booking)}>
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => { setCancelTarget(null); setError('') }}
        title="Cancel Booking"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel ticket <span className="font-semibold">{cancelTarget?.ticketNo}</span>?
          Your seat(s) ({cancelTarget?.seatNumbers?.join(', ')}) will be released immediately.
        </p>
        <Alert variant="error" className="mb-4">{error}</Alert>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
