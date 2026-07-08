import { useEffect, useState } from 'react'
import { collection, doc, addDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Plus, Pencil } from 'lucide-react'
import { db } from '../../lib/firebase'
import { SEAT_LAYOUT_CONFIG } from '../../utils/seatLayout'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../config/constants'

const AMENITY_OPTIONS = ['Comfortable Seats', 'Music System', 'Water Bottle', '2x2 Sofa Seater', 'A/C']

const EMPTY_FORM = { busName: 'New Metro VIP Sofa', busNumber: '', amenities: [...AMENITY_OPTIONS] }

export default function ManageBuses() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'buses'), (snap) => {
      setBuses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(bus) {
    setEditingId(bus.id)
    setForm({ busName: bus.busName, busNumber: bus.busNumber, amenities: bus.amenities?.length ? bus.amenities : [] })
    setError('')
    setModalOpen(true)
  }

  function toggleAmenity(amenity) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.busName.trim() || !form.busNumber.trim()) return setError('Bus name and number are required.')

    setSaving(true)
    try {
      const payload = { busName: form.busName.trim(), busNumber: form.busNumber.trim(), amenities: form.amenities }
      if (editingId) {
        await updateDoc(doc(db, 'buses', editingId), payload)
      } else {
        await addDoc(collection(db, 'buses'), {
          ...payload,
          totalSeats: SEAT_LAYOUT_CONFIG.totalSeats,
          seatLayoutVersion: SEAT_LAYOUT_CONFIG.id,
          isActive: true,
          createdAt: serverTimestamp(),
        })
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save bus.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(bus) {
    await updateDoc(doc(db, 'buses', bus.id), { isActive: !bus.isActive })
  }

  return (
    <AdminLayout title="Manage Buses">
      <SeoHead
        title={`Manage Buses | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus fleet."
        keywords="Metro Air Bus admin buses"
        canonical={`${COMPANY_CONFIG.domain}/admin/buses`}
        noindex
      />

      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} /> Add Bus
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No buses yet. Add one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Bus Name</th>
                <th className="px-5 py-3 font-medium">Bus Number</th>
                <th className="px-5 py-3 font-medium">Seats</th>
                <th className="px-5 py-3 font-medium">Amenities</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-brand-black">{bus.busName}</td>
                  <td className="px-5 py-3">{bus.busNumber}</td>
                  <td className="px-5 py-3">{bus.totalSeats}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(bus.amenities || []).map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{a}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={bus.isActive ? 'success' : 'gray'}>{bus.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEdit(bus)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant={bus.isActive ? 'danger' : 'primary'} onClick={() => toggleActive(bus)}>
                        {bus.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Bus' : 'Add Bus'}>
        <Alert variant="error" className="mb-4">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Name</label>
            <input
              value={form.busName}
              onChange={(e) => setForm((f) => ({ ...f, busName: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
            <input
              value={form.busNumber}
              onChange={(e) => setForm((f) => ({ ...f, busNumber: e.target.value }))}
              placeholder="BA 1 KHA 1234"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 rounded border-gray-400 accent-brand-black"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seat Layout</label>
            <input
              value={`${SEAT_LAYOUT_CONFIG.id} (${SEAT_LAYOUT_CONFIG.totalSeats} seats)`}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>
          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Bus'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  )
}
