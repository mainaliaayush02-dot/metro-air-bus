import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDualDate } from '../utils/adToBs'
import { COMPANY_CONFIG } from '../config/constants'

const CONDITIONS = [
  'Ticket once sold will not be returned.',
  'Tickets can be cancelled only 24 hours before departure upon payment of 50% cancellation fee.',
  'Passenger must reach boarding point 30 min prior.',
  'Company not responsible if passenger misses bus.',
  'Service may be cancelled due to natural calamities, strikes, or other incidents.',
  'Passengers are responsible for themselves and luggage during stoppages midway.',
  'Luggage charge is not mentioned in the bus ticket.',
  'Keep ticket until journey end.',
  'Tickets of present day or next two days with AM/PM issues will not be refunded. Choose time carefully.',
]

const ETicket = forwardRef(function ETicket({ booking, busNumber }, ref) {
  return (
    <div ref={ref} className="bg-white text-brand-black max-w-2xl mx-auto border border-gray-200 rounded-xl overflow-hidden print:border-0 print:rounded-none print:max-w-full">
      <div className="bg-brand-black text-white flex items-center justify-between px-6 py-4">
        <span className="font-semibold">{COMPANY_CONFIG.brand}</span>
        <span className="text-brand-yellow font-extrabold text-lg">🚌 METRO AIR BUS</span>
      </div>

      <div className="text-center text-xs tracking-widest text-gray-400 py-2 border-b border-gray-200">
        ─────────────── eTicket ───────────────
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-4 text-sm border-b border-gray-200">
        <div>
          <p><span className="text-gray-500">Ticket No:</span> <span className="font-semibold">{booking.ticketNo}</span></p>
          <p><span className="text-gray-500">Bus No:</span> <span className="font-semibold">{busNumber || '—'}</span></p>
          <p><span className="text-gray-500">Staff No:</span> <span className="font-semibold">—</span></p>
        </div>
        <div className="text-right">
          <p><span className="text-gray-500">Booking:</span> {formatDualDate(booking.bookingDateAD)}</p>
          <p><span className="text-gray-500">Journey:</span> {formatDualDate(booking.journeyDateAD)}</p>
          <p><span className="text-gray-500">Departure:</span> {booking.departureTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 font-bold">
        <span>From: {booking.from?.toUpperCase()}</span>
        <span>To: {booking.to?.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-4 text-sm border-b border-gray-200">
        <div className="space-y-1">
          <p><span className="text-gray-500">Name:</span> {booking.passengerName}</p>
          <p><span className="text-gray-500">Boarding:</span> {booking.boardingPoint}</p>
          <p><span className="text-gray-500">Dropping:</span> {booking.droppingPoint || '—'}</p>
          <p><span className="text-gray-500">Phone:</span> {booking.passengerPhone}</p>
          <p><span className="text-gray-500">Seat No:</span> {booking.seatNumbers?.join(', ')}</p>
        </div>
        <div className="space-y-1 text-right">
          <p><span className="text-gray-500">No of Passengers:</span> {booking.seatNumbers?.length}</p>
          <p><span className="text-gray-500">Rate:</span> Rs. {booking.rate}</p>
          <p><span className="text-gray-500">Discount:</span> Rs. {(booking.discount || 0).toFixed(2)}{booking.promoCode ? ` (${booking.promoCode})` : ''}</p>
          <p className="font-bold"><span className="text-gray-500 font-normal">Total:</span> Rs. {booking.totalPrice}</p>
        </div>
      </div>

      <div className="flex justify-center py-6 border-b border-gray-200">
        <QRCodeSVG value={JSON.stringify({ ticketNo: booking.ticketNo, bookingId: booking.id })} size={120} />
      </div>

      <div className="px-6 py-4 text-sm border-b border-gray-200">
        <p className="font-semibold mb-1">Contact:</p>
        <p>Suraj: {COMPANY_CONFIG.contacts.join(' / ')}</p>
        <p>Head Office: {COMPANY_CONFIG.headOffice}</p>
      </div>

      <div className="px-6 py-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Conditions:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {CONDITIONS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  )
})

export default ETicket
