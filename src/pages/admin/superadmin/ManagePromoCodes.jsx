import { useEffect, useState } from 'react'
import { collection, doc, addDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Plus } from 'lucide-react'
import { db } from '../../../lib/firebase'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Alert from '../../../components/ui/Alert'
import Spinner from '../../../components/ui/Spinner'
import SeoHead from '../../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../../config/constants'

const EMPTY_FORM = { code: '', discountAmount: '' }

export default function ManagePromoCodes() {
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'promoCodes'), (snap) => {
      setPromoCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const code = form.code.trim().toUpperCase()
    const discountAmount = Number(form.discountAmount)

    if (!code) return setError('Promo code is required.')
    if (!discountAmount || discountAmount <= 0) return setError('Discount amount must be greater than 0.')
    if (promoCodes.some((p) => p.code === code)) return setError('This promo code already exists.')

    setSaving(true)
    try {
      await addDoc(collection(db, 'promoCodes'), {
        code,
        discountAmount,
        isActive: true,
        createdAt: serverTimestamp(),
      })
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save promo code.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(promo) {
    await updateDoc(doc(db, 'promoCodes', promo.id), { isActive: !promo.isActive })
  }

  return (
    <AdminLayout title="Manage Promo Codes">
      <SeoHead
        title={`Manage Promo Codes | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus promo codes."
        keywords="Metro Air Bus superadmin promo codes"
        canonical={`${COMPANY_CONFIG.domain}/superadmin/promo-codes`}
      />

      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} /> Add Promo Code
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No promo codes yet. Add one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount (per seat)</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-mono font-bold text-brand-black">{promo.code}</td>
                  <td className="px-5 py-3">Rs. {promo.discountAmount}</td>
                  <td className="px-5 py-3">
                    <Badge variant={promo.isActive ? 'success' : 'gray'}>{promo.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button variant={promo.isActive ? 'danger' : 'primary'} onClick={() => toggleActive(promo)}>
                      {promo.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Promo Code">
        <Alert variant="error" className="mb-4">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME400"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (Rs. per seat)</label>
            <input
              type="number"
              min={1}
              value={form.discountAmount}
              onChange={(e) => setForm((f) => ({ ...f, discountAmount: e.target.value }))}
              placeholder="400"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Create Promo Code'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  )
}
