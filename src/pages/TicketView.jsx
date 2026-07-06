import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { db } from '../lib/firebase'
import ETicket from '../components/ETicket'
import SeoHead from '../seo/SeoHead'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { COMPANY_CONFIG } from '../config/constants'

export default function TicketView() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [busNumber, setBusNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: booking ? `Ticket-${booking.ticketNo}` : 'Metro-Air-Bus-Ticket',
  })

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'bookings', bookingId), (snap) => {
      setBooking(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [bookingId])

  useEffect(() => {
    if (!booking?.scheduleId) return
    getDoc(doc(db, 'schedules', booking.scheduleId)).then((snap) => {
      if (snap.exists()) setBusNumber(snap.data().busNumber)
    })
  }, [booking?.scheduleId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    )
  }

  if (!booking) {
    return <div className="text-center py-24 text-gray-500">Ticket not found.</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SeoHead
        title={`E-Ticket ${booking.ticketNo} | ${COMPANY_CONFIG.name}`}
        description="Your Metro Air Bus e-ticket."
        keywords="Metro Air Bus ticket"
        canonical={`${COMPANY_CONFIG.domain}/ticket/${bookingId}`}
        noindex
      />

      <div className="flex items-center justify-between mb-4 no-print">
        <h1 className="text-xl font-bold text-brand-black">Your E-Ticket</h1>
        <Button variant="dark" onClick={handlePrint}>
          <Printer size={18} /> Print Ticket
        </Button>
      </div>

      <ETicket ref={printRef} booking={booking} busNumber={busNumber} />
    </div>
  )
}
