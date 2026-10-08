import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resetPassword } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleLoginSuccess } = useAuth()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const qEmail = searchParams.get('email') || ''
    const qToken = searchParams.get('token') || ''
    setEmail(qEmail)
    setToken(qToken)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Password reset token is missing from the link.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await resetPassword({ email, token, password })
      const data = res.data

      if (data.success) {
        setMessage('Password reset successful! Logging you in...')
        if (data.token && data.user && handleLoginSuccess) {
          handleLoginSuccess(data.token, data.user)
        }
        setTimeout(() => navigate('/'), 2000)
      } else {
        setError(data.message || 'Failed to reset password.')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'Password reset failed. Link may be invalid or expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lift p-8 w-full">
          <h1 className="heading-font text-3xl text-[var(--color-primary)] mb-2 text-center">
            Set New Password
          </h1>
          <p className="text-gray-600 text-sm text-center mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none"
                readOnly={Boolean(searchParams.get('email'))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Repeat new password"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
              }`}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
