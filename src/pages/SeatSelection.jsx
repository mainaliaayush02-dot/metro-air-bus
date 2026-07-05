import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import SeatMap from '../components/SeatMap'
import PassengerDetailsModal from '../components/PassengerDetailsModal'
import SeoHead from '../seo/SeoHead'
import Spinner from '../components/ui/Spinner'
import { formatDualDate } from '../utils/adToBs'
import { COMPANY_CONFIG } from '../config/constants'

export default function SeatSelection() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalSeats, setModalSeats] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'schedules', scheduleId), (snap) => {
      setSchedule(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [scheduleId])

  useEffect(() => {
    if (!schedule?.routeId) return
    getDoc(doc(db, 'routes', schedule.routeId)).then((snap) => {
      setRoute(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
  }, [schedule?.routeId])

  function handleProceed(selectedSeats) {
    setModalSeats(selectedSeats)
  }

  function handleBookingSuccess(bookingId) {
    setModalSeats(null)
    navigate(`/ticket/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    )
  }

  if (!schedule) {
    return <div className="text-center py-24 text-gray-500">Schedule not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead
        title={`Select Seats | ${schedule.from} to ${schedule.to} | ${COMPANY_CONFIG.name}`}
        description={`Choose your seats for the ${schedule.from} to ${schedule.to} VIP Sofa bus.`}
        keywords="Metro Air Bus seat selection, bus seat booking Nepal"
        canonical={`${COMPANY_CONFIG.domain}/seats/${scheduleId}`}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">
          {schedule.from} → {schedule.to}
        </h1>
        <p className="text-sm text-gray-500">
          {formatDualDate(schedule.departureDateAD)} · Departure {schedule.departureTime} · {schedule.busName}
        </p>
      </div>

      <SeatMap scheduleId={scheduleId} price={schedule.basePrice} onProceed={handleProceed} />

      {modalSeats && (
        <PassengerDetailsModal
          isOpen={!!modalSeats}
          onClose={() => setModalSeats(null)}
          scheduleId={scheduleId}
          schedule={schedule}
          seatNumbers={modalSeats}
          boardingPoints={route?.boardingPoints || []}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
