import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import SeatMap from '../../components/SeatMap'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { formatDualDate } from '../../utils/adToBs'
import { COMPANY_CONFIG } from '../../config/constants'

export default function SeatHold() {
  const { scheduleId } = useParams()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'schedules', scheduleId), (snap) => {
      setSchedule(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [scheduleId])

  return (
    <AdminLayout title="Seat Hold">
      <SeoHead
        title={`Seat Hold | ${COMPANY_CONFIG.name}`}
        description="Hold or release seats for a schedule."
        keywords="Metro Air Bus admin seat hold"
        canonical={`${COMPANY_CONFIG.domain}/admin/seat-hold/${scheduleId}`}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : !schedule ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          Schedule not found.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {schedule.from} → {schedule.to} · {formatDualDate(schedule.departureDateAD)} · {schedule.departureTime} · {schedule.busName}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Click an available seat to place it on hold. Click a held seat to release it back to available.
          </p>
          <SeatMap scheduleId={scheduleId} price={schedule.basePrice} mode="admin-hold" />
        </>
      )}
    </AdminLayout>
  )
}
