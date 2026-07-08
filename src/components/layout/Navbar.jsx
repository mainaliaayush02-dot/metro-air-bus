import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, userDoc, isOperator } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-brand-black sticky top-0 z-40 no-print">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-brand-yellow font-extrabold text-xl tracking-tight">METRO AIR BUS</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="text-white hover:text-brand-yellow font-medium">Home</Link>
          <Link to="/contact" className="text-white hover:text-brand-yellow font-medium">Contact</Link>
          {user && (
            <Link to="/my-bookings" className="text-white hover:text-brand-yellow font-medium">My Bookings</Link>
          )}
          {isOperator && (
            <Link to="/admin" className="text-white hover:text-brand-yellow font-medium">Admin</Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 flex items-center gap-1">
                <User size={16} /> {userDoc?.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-white hover:text-brand-orange font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-white hover:text-brand-yellow font-medium">Login</Link>
              <Link
                to="/register"
                className="bg-brand-yellow text-brand-black font-bold px-4 py-1.5 rounded-lg hover:bg-brand-yellow-dark"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-brand-black border-t border-white/10 px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setOpen(false)} className="text-white">Home</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="text-white">Contact</Link>
          {user && (
            <Link to="/my-bookings" onClick={() => setOpen(false)} className="text-white">My Bookings</Link>
          )}
          {isOperator && (
            <Link to="/admin" onClick={() => setOpen(false)} className="text-white">Admin</Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="text-left text-brand-orange">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-white">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="text-brand-yellow font-bold">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
