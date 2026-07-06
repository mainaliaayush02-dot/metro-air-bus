import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../config/constants'

const STATUS_VARIANT = { confirmed: 'success', cancelled: 'danger', used: 'gray' }

function todayAD() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminDashboard() {
  const [todaysBookings, setTodaysBookings] = useState([])
  const [todaysSchedules, setTodaysSchedules] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = todayAD()

    const unsubBookings = onSnapshot(
      query(collection(db, 'bookings'), where('bookingDateAD', '==', today)),
      (snap) => setTodaysBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    const unsubSchedules = onSnapshot(
      query(collection(db, 'schedules'), where('departureDateAD', '==', today)),
      (snap) => setTodaysSchedules(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    const unsubRecent = onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(10)),
      (snap) => {
        setRecentBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }
    )

    return () => {
      unsubBookings()
      unsubSchedules()
      unsubRecent()
    }
  }, [])

  const todaysRevenue = todaysBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const todaysSeatsAvailable = todaysSchedules.reduce((sum, s) => sum + (s.availableSeats || 0), 0)

  return (
    <AdminLayout title="Admin Dashboard">
      <SeoHead
        title={`Admin Dashboard | ${COMPANY_CONFIG.name}`}
        description="Metro Air Bus admin dashboard."
        keywords="Metro Air Bus admin"
        canonical={`${COMPANY_CONFIG.domain}/admin`}
        noindex
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Today's Bookings" value={todaysBookings.length} />
        <StatCard label="Today's Revenue" value={`Rs. ${todaysRevenue}`} />
        <StatCard label="Seats Available Today" value={todaysSeatsAvailable} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-brand-black">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-brand-orange font-semibold hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size={28} />
          </div>
        ) : recentBookings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-2 font-medium">Ticket No</th>
                  <th className="px-5 py-2 font-medium">Passenger</th>
                  <th className="px-5 py-2 font-medium">Route</th>
                  <th className="px-5 py-2 font-medium">Seats</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-brand-black whitespace-nowrap">{b.ticketNo}</td>
                    <td className="px-5 py-3">{b.passengerName}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{b.from} → {b.to}</td>
                    <td className="px-5 py-3">{b.seatNumbers?.join(', ')}</td>
                    <td className="px-5 py-3">Rs. {b.totalPrice}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_VARIANT[b.status] || 'gray'}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-brand-black mt-1">{value}</p>
    </div>
  )
}
