import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { cancelBooking } from '../../utils/cancelBooking'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../config/constants'

const STATUS_VARIANT = { confirmed: 'success', cancelled: 'danger', used: 'gray' }

export default function ManageBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('')
  const [routeFilter, setRouteFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [manualScheduleId, setManualScheduleId] = useState('')

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    const unsubRoutes = onSnapshot(collection(db, 'routes'), (snap) => {
      setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubSchedules = onSnapshot(query(collection(db, 'schedules'), where('status', '==', 'scheduled')), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => a.departureDateAD?.localeCompare(b.departureDateAD))
      setSchedules(list)
    })
    return () => {
      unsubBookings()
      unsubRoutes()
      unsubSchedules()
    }
  }, [])

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => !dateFilter || b.journeyDateAD === dateFilter)
      .filter((b) => !routeFilter || `${b.from}|${b.to}` === routeFilter)
      .filter((b) => !statusFilter || b.status === statusFilter)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [bookings, dateFilter, routeFilter, statusFilter])

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
        isOperator: true,
      })
      setCancelTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <AdminLayout title="Manage Bookings">
      <SeoHead
        title={`Manage Bookings | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus bookings."
        keywords="Metro Air Bus admin bookings"
        canonical={`${COMPANY_CONFIG.domain}/admin/bookings`}
        noindex
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 mb-4">
        <p className="text-sm font-semibold text-gray-500 mb-2">New Manual Booking (walk-in passenger)</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={manualScheduleId}
            onChange={(e) => setManualScheduleId(e.target.value)}
            className="flex-1 min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="">Select a schedule</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.from} → {s.to} · {s.departureDateAD} · {s.departureTime} ({s.availableSeats} left)
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            disabled={!manualScheduleId}
            onClick={() => navigate(`/seats/${manualScheduleId}`)}
          >
            Book Seats
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          <option value="">All routes</option>
          {routes.map((r) => (
            <option key={r.id} value={`${r.from}|${r.to}`}>{r.from} → {r.to}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="used">Used</option>
        </select>
        {(dateFilter || routeFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setRouteFilter(''); setStatusFilter('') }}
            className="text-sm text-brand-orange font-semibold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No bookings match these filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Ticket No</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Seats</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-brand-black whitespace-nowrap">{b.ticketNo}</td>
                  <td className="px-5 py-3">{b.passengerName}</td>
                  <td className="px-5 py-3">{b.passengerPhone}</td>
                  <td className="px-5 py-3">{b.seatNumbers?.join(', ')}</td>
                  <td className="px-5 py-3">Rs. {b.totalPrice}</td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[b.status] || 'gray'}>{b.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button as={Link} to={`/ticket/${b.id}`} variant="outline">View</Button>
                      {b.status === 'confirmed' && (
                        <Button variant="danger" onClick={() => setCancelTarget(b)}>Cancel</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!cancelTarget} onClose={() => { setCancelTarget(null); setError('') }} title="Cancel Booking">
        <p className="text-sm text-gray-600 mb-4">
          Cancel ticket <span className="font-semibold">{cancelTarget?.ticketNo}</span> for{' '}
          <span className="font-semibold">{cancelTarget?.passengerName}</span>? Seat(s){' '}
          {cancelTarget?.seatNumbers?.join(', ')} will be released immediately.
        </p>
        <Alert variant="error" className="mb-4">{error}</Alert>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>Keep Booking</Button>
          <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
