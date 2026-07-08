import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/WhatsAppButton'

import Home from './pages/Home'
import Contact from './pages/Contact'
import SearchResults from './pages/SearchResults'
import SeatSelection from './pages/SeatSelection'
import BookingConfirm from './pages/BookingConfirm'
import TicketView from './pages/TicketView'
import MyBookings from './pages/MyBookings'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageRoutes from './pages/admin/ManageRoutes'
import ManageBuses from './pages/admin/ManageBuses'
import ManageSchedules from './pages/admin/ManageSchedules'
import ManageBookings from './pages/admin/ManageBookings'
import SeatHold from './pages/admin/SeatHold'
import SuperDashboard from './pages/admin/superadmin/SuperDashboard'
import ManageOperators from './pages/admin/superadmin/ManageOperators'
import ManagePromoCodes from './pages/admin/superadmin/ManagePromoCodes'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function OperatorRoute({ children }) {
  const { user, isOperator } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isOperator) return <Navigate to="/" replace />
  return children
}

function SuperAdminRoute({ children }) {
  const { user, isSuperAdmin } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isSuperAdmin) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/seats/:scheduleId" element={<SeatSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/booking/:bookingId" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
          <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketView /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          <Route path="/admin" element={<OperatorRoute><AdminDashboard /></OperatorRoute>} />
          <Route path="/admin/routes" element={<OperatorRoute><ManageRoutes /></OperatorRoute>} />
          <Route path="/admin/buses" element={<OperatorRoute><ManageBuses /></OperatorRoute>} />
          <Route path="/admin/schedules" element={<OperatorRoute><ManageSchedules /></OperatorRoute>} />
          <Route path="/admin/bookings" element={<OperatorRoute><ManageBookings /></OperatorRoute>} />
          <Route path="/admin/seat-hold/:scheduleId" element={<OperatorRoute><SeatHold /></OperatorRoute>} />

          <Route path="/superadmin" element={<SuperAdminRoute><SuperDashboard /></SuperAdminRoute>} />
          <Route path="/superadmin/operators" element={<SuperAdminRoute><ManageOperators /></SuperAdminRoute>} />
          <Route path="/superadmin/promo-codes" element={<SuperAdminRoute><ManagePromoCodes /></SuperAdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default App
