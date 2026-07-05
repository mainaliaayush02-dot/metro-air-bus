import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Route as RouteIcon,
  Bus,
  CalendarClock,
  Ticket,
  Shield,
  Users,
  Tag,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/routes', label: 'Routes', icon: RouteIcon },
  { to: '/admin/buses', label: 'Buses', icon: Bus },
  { to: '/admin/schedules', label: 'Schedules', icon: CalendarClock },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
]

const SUPERADMIN_NAV_ITEMS = [
  { to: '/superadmin', label: 'Super Dashboard', icon: Shield, end: true },
  { to: '/superadmin/operators', label: 'Operators', icon: Users },
  { to: '/superadmin/promo-codes', label: 'Promo Codes', icon: Tag },
]

export default function AdminLayout({ children, title }) {
  const { isSuperAdmin } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-56 shrink-0">
        <nav className="bg-white rounded-xl border border-gray-200 shadow-md p-3 flex md:flex-col gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand-black text-brand-yellow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <div className="border-t border-gray-200 my-2 md:my-2" />
              {SUPERADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-brand-black text-brand-yellow'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        {title && <h1 className="text-2xl font-extrabold text-brand-black mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  )
}
