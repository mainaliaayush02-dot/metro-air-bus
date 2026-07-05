import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { Plus, CalendarDays, List as ListIcon } from 'lucide-react'
import { db } from '../../lib/firebase'
import { SEAT_LAYOUT_CONFIG } from '../../utils/seatLayout'
import { adToBS, formatDualDate } from '../../utils/adToBs'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../config/constants'

const STATUS_VARIANT = { scheduled: 'success', cancelled: 'danger', completed: 'gray' }

function emptyForm() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    routeId: '',
    busId: '',
    departureDateAD: tomorrow.toISOString().slice(0, 10),
    departureTime: '03:00 PM',
    arrivalTime: '06:00 PM',
    basePrice: 2200,
  }
}

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState([])
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => a.departureDateAD?.localeCompare(b.departureDateAD))
      setSchedules(list)
      setLoading(false)
    })
    const unsubRoutes = onSnapshot(query(collection(db, 'routes'), where('isActive', '==', true)), (snap) => {
      setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubBuses = onSnapshot(query(collection(db, 'buses'), where('isActive', '==', true)), (snap) => {
      setBuses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsubSchedules()
      unsubRoutes()
      unsubBuses()
    }
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setError('')
    setModalOpen(true)
  }

  function openEdit(schedule) {
    setEditingId(schedule.id)
    setForm({
      routeId: schedule.routeId,
      busId: schedule.busId,
      departureDateAD: schedule.departureDateAD,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      basePrice: schedule.basePrice,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const route = routes.find((r) => r.id === form.routeId)
    const bus = buses.find((b) => b.id === form.busId)
    if (!route) return setError('Please select a route.')
    if (!bus) return setError('Please select a bus.')
    if (!form.departureDateAD) return setError('Please select a departure date.')
    if (!form.departureTime.trim() || !form.arrivalTime.trim()) return setError('Departure and arrival time are required.')
    if (!form.basePrice || Number(form.basePrice) <= 0) return setError('Base price must be greater than 0.')

    setSaving(true)
    try {
      const payload = {
        routeId: route.id,
        busId: bus.id,
        busName: bus.busName,
        busNumber: bus.busNumber,
        from: route.from,
        to: route.to,
        departureDateAD: form.departureDateAD,
        departureDateBS: adToBS(form.departureDateAD),
        departureTime: form.departureTime.trim(),
        arrivalTime: form.arrivalTime.trim(),
        basePrice: Number(form.basePrice),
      }

      if (editingId) {
        await updateDoc(doc(db, 'schedules', editingId), payload)
      } else {
        const scheduleRef = await addDoc(collection(db, 'schedules'), {
          ...payload,
          availableSeats: SEAT_LAYOUT_CONFIG.totalSeats,
          status: 'scheduled',
          createdAt: serverTimestamp(),
        })

        const batch = writeBatch(db)
        for (const seatId of SEAT_LAYOUT_CONFIG.allSeats) {
          batch.set(doc(db, 'schedules', scheduleRef.id, 'seats', seatId), {
            seatId,
            status: 'available',
            bookedBy: null,
            bookingId: null,
            updatedAt: serverTimestamp(),
          })
        }
        await batch.commit()
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save schedule.')
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(schedule, status) {
    await updateDoc(doc(db, 'schedules', schedule.id), { status })
  }

  const groupedByDate = schedules.reduce((acc, s) => {
    acc[s.departureDateAD] = acc[s.departureDateAD] || []
    acc[s.departureDateAD].push(s)
    return acc
  }, {})

  return (
    <AdminLayout title="Manage Schedules">
      <SeoHead
        title={`Manage Schedules | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus schedules."
        keywords="Metro Air Bus admin schedules"
        canonical={`${COMPANY_CONFIG.domain}/admin/schedules`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-brand-black text-white' : 'text-gray-500'}`}
          >
            <ListIcon size={14} /> List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === 'calendar' ? 'bg-brand-black text-white' : 'text-gray-500'}`}
          >
            <CalendarDays size={14} /> Calendar
          </button>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} /> Add Schedule
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No schedules yet. Add one to get started.
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {schedules.map((s) => (
            <ScheduleRow key={s.id} schedule={s} onEdit={() => openEdit(s)} onSetStatus={setStatus} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-bold text-gray-500 mb-2">{formatDualDate(date)}</h3>
              <div className="space-y-3">
                {items.map((s) => (
                  <ScheduleRow key={s.id} schedule={s} onEdit={() => openEdit(s)} onSetStatus={setStatus} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Schedule' : 'Add Schedule'} className="max-w-lg">
        <Alert variant="error" className="mb-4">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              value={form.routeId}
              onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.from} → {r.to}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
            <select
              value={form.busId}
              onChange={(e) => setForm((f) => ({ ...f, busId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">Select bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>{b.busName} — {b.busNumber}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input
              type="date"
              value={form.departureDateAD}
              onChange={(e) => setForm((f) => ({ ...f, departureDateAD: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            {form.departureDateAD && <p className="text-xs text-gray-400 mt-1">BS: {adToBS(form.departureDateAD) || '—'}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              <input
                value={form.departureTime}
                onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
                placeholder="03:00 PM"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
              <input
                value={form.arrivalTime}
                onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))}
                placeholder="06:00 PM"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Rs.)</label>
            <input
              type="number"
              min={1}
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Schedule'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  )
}

function ScheduleRow({ schedule, onEdit, onSetStatus }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand-black">{schedule.from} → {schedule.to}</p>
          <p className="text-sm text-gray-500">{formatDualDate(schedule.departureDateAD)} · {schedule.departureTime} – {schedule.arrivalTime}</p>
          <p className="text-sm text-gray-500 mt-1">{schedule.busName} · {schedule.busNumber}</p>
        </div>
        <Badge variant={STATUS_VARIANT[schedule.status] || 'gray'}>{schedule.status}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
        <span>Rs. {schedule.basePrice} / seat</span>
        <span>{schedule.availableSeats} seats available</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onEdit}>Edit</Button>
        {schedule.status === 'scheduled' && (
          <>
            <Button as={Link} to={`/admin/seat-hold/${schedule.id}`} variant="outline">Seat Hold</Button>
            <Button variant="danger" onClick={() => onSetStatus(schedule, 'cancelled')}>Cancel</Button>
            <Button variant="outline" onClick={() => onSetStatus(schedule, 'completed')}>Mark Complete</Button>
          </>
        )}
      </div>
    </div>
  )
}
