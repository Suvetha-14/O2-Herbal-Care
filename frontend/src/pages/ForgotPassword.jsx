import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { forgotPassword } from '../services/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await forgotPassword(email)
      const data = res.data
      if (data.success) {
        setMessage(data.message || 'If an account exists, a password reset link has been sent.')
      } else {
        setError(data.message || 'Failed to send password reset link.')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to process request. Please try again.'
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
            Forgot Password
          </h1>
          <p className="text-gray-600 text-sm text-center mb-6">
            Enter your registered email address to receive a password reset link.
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="your@email.com"
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
              {loading ? 'Sending link...' : 'Send Reset Link'}
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
