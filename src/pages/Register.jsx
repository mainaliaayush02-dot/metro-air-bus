import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import SeoHead from '../seo/SeoHead'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { COMPANY_CONFIG } from '../config/constants'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Full name is required.')
    if (!/^9\d{9}$/.test(form.phone)) return setError('Enter a valid Nepal phone number (e.g. 98xxxxxxxx).')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
      await updateProfile(cred.user, { displayName: form.name.trim() })
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: 'passenger',
        isActive: true,
        createdAt: serverTimestamp(),
      })
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(mapAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <SeoHead
        title={`Register | ${COMPANY_CONFIG.name}`}
        description="Create a Metro Air Bus account to book VIP Sofa bus tickets online for Kathmandu to Kakarbhitta and return."
        keywords="Metro Air Bus register, create account, bus ticket booking Nepal"
        canonical={`${COMPANY_CONFIG.domain}/register`}
        noindex
      />
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-extrabold text-brand-black mb-1">Create an Account</h1>
        <p className="text-sm text-gray-500 mb-6">Book your VIP Sofa bus tickets online.</p>

        <Alert variant="error" className="mb-4">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={update('name')}
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={form.phone}
              onChange={update('phone')}
              type="tel"
              placeholder="98xxxxxxxx"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={form.email}
              onChange={update('email')}
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              value={form.password}
              onChange={update('password')}
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-orange font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
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
      return 'Something went wrong. Please try again.'
  }
}
