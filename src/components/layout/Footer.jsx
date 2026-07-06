import { Phone, MapPin } from 'lucide-react'
import { COMPANY_CONFIG } from '../../config/constants'

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-300 no-print mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-brand-yellow font-extrabold text-lg mb-2">METRO AIR BUS</h3>
          <p className="text-sm text-gray-400">{COMPANY_CONFIG.brand}</p>
          <p className="text-sm text-gray-400 mt-2">Kathmandu ↔ Kakarbhitta<br />Comfortable. On Time. Every Time.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p className="flex items-center gap-2 text-sm">
            <Phone size={14} /> {COMPANY_CONFIG.contacts.join(' / ')}
          </p>
          <p className="flex items-center gap-2 text-sm mt-1">
            <Phone size={14} /> Head Office: {COMPANY_CONFIG.headOffice}
          </p>
          <p className="flex items-center gap-2 text-sm mt-1">
            <MapPin size={14} /> {COMPANY_CONFIG.boardingPoint}
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Route</h4>
          <p className="text-sm">Kathmandu → Kakarbhitta</p>
          <p className="text-sm">Kakarbhitta → Kathmandu</p>
          <p className="text-sm text-gray-400 mt-1">Daily departure 03:00 PM</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Metro Air Bus. All rights reserved.
      </div>
    </footer>
  )
}
