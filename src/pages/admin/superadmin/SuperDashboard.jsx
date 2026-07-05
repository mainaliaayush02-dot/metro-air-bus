import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import AdminLayout from '../../../components/layout/AdminLayout'
import SeoHead from '../../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../../config/constants'

export default function SuperDashboard() {
  const [bookings, setBookings] = useState([])
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [operators, setOperators] = useState([])

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      setBookings(snap.docs.map((d) => d.data()))
    })
    const unsubRoutes = onSnapshot(query(collection(db, 'routes'), where('isActive', '==', true)), (snap) => {
      setRoutes(snap.docs.map((d) => d.data()))
    })
    const unsubBuses = onSnapshot(query(collection(db, 'buses'), where('isActive', '==', true)), (snap) => {
      setBuses(snap.docs.map((d) => d.data()))
    })
    const unsubOperators = onSnapshot(query(collection(db, 'users'), where('role', '==', 'operator')), (snap) => {
      setOperators(snap.docs.map((d) => d.data()))
    })
    return () => {
      unsubBookings()
      unsubRoutes()
      unsubBuses()
      unsubOperators()
    }
  }, [])

  const totalRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  return (
    <AdminLayout title="Super Admin Dashboard">
      <SeoHead
        title={`Super Admin Dashboard | ${COMPANY_CONFIG.name}`}
        description="Metro Air Bus platform-wide statistics."
        keywords="Metro Air Bus superadmin"
        canonical={`${COMPANY_CONFIG.domain}/superadmin`}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Total Revenue" value={`Rs. ${totalRevenue}`} />
        <StatCard label="Active Routes" value={routes.length} />
        <StatCard label="Active Buses" value={buses.length} />
        <StatCard label="Operators" value={operators.length} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
        <h2 className="font-bold text-brand-black mb-4">Quick Links</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickLink to="/admin" label="Admin Dashboard" />
          <QuickLink to="/admin/routes" label="Manage Routes" />
          <QuickLink to="/admin/buses" label="Manage Buses" />
          <QuickLink to="/admin/schedules" label="Manage Schedules" />
          <QuickLink to="/admin/bookings" label="Manage Bookings" />
          <QuickLink to="/superadmin/operators" label="Manage Operators" />
        </div>
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

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-brand-black hover:bg-gray-50 transition-colors"
    >
      {label}
    </Link>
  )
}
