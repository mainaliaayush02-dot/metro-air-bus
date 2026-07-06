import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import SeoHead from '../seo/SeoHead'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { COMPANY_CONFIG } from '../config/constants'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email.trim(), form.password)
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      const data = snap.exists() ? snap.data() : null

      if (data && data.isActive === false) {
        await auth.signOut()
        setError('This account has been deactivated. Contact support.')
        setLoading(false)
        return
      }

      const role = data?.role || 'passenger'
      const returnTo = location.state?.from

      if (returnTo) {
        navigate(returnTo, { replace: true })
      } else if (role === 'superadmin') {
        navigate('/superadmin', { replace: true })
      } else if (role === 'operator') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(mapAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <SeoHead
        title={`Login | ${COMPANY_CONFIG.name}`}
        description="Login to your Metro Air Bus account to book and manage your VIP Sofa bus tickets."
        keywords="Metro Air Bus login, bus ticket account Nepal"
        canonical={`${COMPANY_CONFIG.domain}/login`}
        noindex
      />
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <h1 className="text-2xl font-extrabold text-brand-black mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">Login to manage your bookings.</p>

        <Alert variant="error" className="mb-4">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-orange font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
