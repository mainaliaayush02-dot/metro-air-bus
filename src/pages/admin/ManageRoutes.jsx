import { useEffect, useState } from 'react'
import { collection, doc, addDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Plus, Pencil, X } from 'lucide-react'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import SeoHead from '../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../config/constants'

const EMPTY_FORM = {
  from: '',
  to: '',
  fromCode: '',
  toCode: '',
  boardingPoints: [{ name: '', time: '' }],
}

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'routes'), (snap) => {
      setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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

  function openEdit(route) {
    setEditingId(route.id)
    setForm({
      from: route.from,
      to: route.to,
      fromCode: route.fromCode || '',
      toCode: route.toCode || '',
      boardingPoints: route.boardingPoints?.length ? route.boardingPoints : [{ name: '', time: '' }],
    })
    setError('')
    setModalOpen(true)
  }

  function updateBoardingPoint(index, field, value) {
    setForm((f) => ({
      ...f,
      boardingPoints: f.boardingPoints.map((bp, i) => (i === index ? { ...bp, [field]: value } : bp)),
    }))
  }

  function addBoardingPoint() {
    setForm((f) => ({ ...f, boardingPoints: [...f.boardingPoints, { name: '', time: '' }] }))
  }

  function removeBoardingPoint(index) {
    setForm((f) => ({ ...f, boardingPoints: f.boardingPoints.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.from.trim() || !form.to.trim()) return setError('From and To are required.')
    const boardingPoints = form.boardingPoints.filter((bp) => bp.name.trim() && bp.time.trim())
    if (boardingPoints.length === 0) return setError('Add at least one boarding point.')

    setSaving(true)
    try {
      const payload = {
        from: form.from.trim(),
        to: form.to.trim(),
        fromCode: form.fromCode.trim(),
        toCode: form.toCode.trim(),
        boardingPoints,
      }
      if (editingId) {
        await updateDoc(doc(db, 'routes', editingId), payload)
      } else {
        await addDoc(collection(db, 'routes'), { ...payload, isActive: true, createdAt: serverTimestamp() })
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save route.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(route) {
    await updateDoc(doc(db, 'routes', route.id), { isActive: !route.isActive })
  }

  return (
    <AdminLayout title="Manage Routes">
      <SeoHead
        title={`Manage Routes | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus routes."
        keywords="Metro Air Bus admin routes"
        canonical={`${COMPANY_CONFIG.domain}/admin/routes`}
        noindex
      />

      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} /> Add Route
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No routes yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-brand-black">
                    {route.from} ({route.fromCode}) → {route.to} ({route.toCode})
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {route.boardingPoints?.map((bp) => (
                      <span key={bp.name} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1">
                        {bp.name} — {bp.time}
                      </span>
                    ))}
                  </div>
                </div>
                <Badge variant={route.isActive ? 'success' : 'gray'}>
                  {route.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => openEdit(route)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant={route.isActive ? 'danger' : 'primary'} onClick={() => toggleActive(route)}>
                  {route.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Route' : 'Add Route'} className="max-w-lg">
        <Alert variant="error" className="mb-4">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Code</label>
              <input
                value={form.fromCode}
                onChange={(e) => setForm((f) => ({ ...f, fromCode: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Code</label>
              <input
                value={form.toCode}
                onChange={(e) => setForm((f) => ({ ...f, toCode: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Boarding Points</label>
              <button type="button" onClick={addBoardingPoint} className="text-xs font-semibold text-brand-orange hover:underline">
                + Add point
              </button>
            </div>
            <div className="space-y-2">
              {form.boardingPoints.map((bp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={bp.name}
                    onChange={(e) => updateBoardingPoint(i, 'name', e.target.value)}
                    placeholder="Name"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                  <input
                    value={bp.time}
                    onChange={(e) => updateBoardingPoint(i, 'time', e.target.value)}
                    placeholder="03:00 PM"
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                  {form.boardingPoints.length > 1 && (
                    <button type="button" onClick={() => removeBoardingPoint(i)} className="text-gray-400 hover:text-red-600">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Route'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  )
}
