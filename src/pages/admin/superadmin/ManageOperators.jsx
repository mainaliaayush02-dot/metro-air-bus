import { useEffect, useState } from 'react'
import { collection, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore'
import { Plus } from 'lucide-react'
import { db } from '../../../lib/firebase'
import { createOperatorAccount } from '../../../utils/createOperator'
import AdminLayout from '../../../components/layout/AdminLayout'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Alert from '../../../components/ui/Alert'
import Spinner from '../../../components/ui/Spinner'
import SeoHead from '../../../seo/SeoHead'
import { COMPANY_CONFIG } from '../../../config/constants'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

export default function ManageOperators() {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'users'), where('role', '==', 'operator')), (snap) => {
      setOperators(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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

    if (!form.name.trim()) return setError('Name is required.')
    if (!/^9\d{9}$/.test(form.phone)) return setError('Enter a valid Nepal phone number (e.g. 98xxxxxxxx).')
    if (!form.email.trim()) return setError('Email is required.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setSaving(true)
    try {
      await createOperatorAccount({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      setModalOpen(false)
    } catch (err) {
      setError(mapAuthError(err.code) || err.message || 'Failed to create operator.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(operatorAccount) {
    await updateDoc(doc(db, 'users', operatorAccount.id), { isActive: !operatorAccount.isActive })
  }

  return (
    <AdminLayout title="Manage Operators">
      <SeoHead
        title={`Manage Operators | ${COMPANY_CONFIG.name}`}
        description="Manage Metro Air Bus operator accounts."
        keywords="Metro Air Bus superadmin operators"
        canonical={`${COMPANY_CONFIG.domain}/superadmin/operators`}
        noindex
      />

      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} /> Add Operator
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : operators.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-10 text-center text-gray-500">
          No operator accounts yet. Add one to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr key={op.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-brand-black">{op.name}</td>
                  <td className="px-5 py-3">{op.email}</td>
                  <td className="px-5 py-3">{op.phone}</td>
                  <td className="px-5 py-3">
                    <Badge variant={op.isActive ? 'success' : 'gray'}>{op.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button variant={op.isActive ? 'danger' : 'primary'} onClick={() => toggleActive(op)}>
                      {op.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Operator">
        <Alert variant="error" className="mb-4">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="98xxxxxxxx"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Creating...' : 'Create Operator'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  )
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak.'
    default:
      return null
  }
}
