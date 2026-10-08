import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { loginUser, sendOtp, verifyOtp } from '../services/authApi'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from || '/'
  const promptReason = location.state?.reason || ''

  const { handleLoginSuccess } = useAuth()
  const [step, setStep] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  // Login with email & password
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await loginUser({ email, password })
      const data = res.data

      if (data.success) {
        handleLoginSuccess(data.token, data.user)
        setMessage('✅ Login successful! Redirecting...')
        setTimeout(() => navigate(returnTo), 1000)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please check credentials or backend server.')
    } finally {
      setLoading(false)
    }
  }

  // Send OTP for signup
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await sendOtp(email)
      const data = res.data

      if (data.success) {
        setOtpSent(true)
        setMessage(`✅ Verification code sent to ${email}`)
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      console.error('Send OTP error:', err)
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP and create account
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await verifyOtp({
        identifier: email,
        otp,
        name,
        password,
      })
      const data = res.data

      if (data.success) {
        handleLoginSuccess(data.token, data.user)
        setMessage('✅ Account created & logged in! Redirecting...')
        setTimeout(() => navigate(returnTo), 1000)
      } else {
        setError(data.message || 'OTP verification failed')
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lift p-8 w-full">
          <h1 className="heading-font text-3xl text-[var(--color-primary)] mb-6 text-center">
            {step === 'login' ? 'Login' : 'Sign Up'}
          </h1>

          {/* Redirect / Prompt Notice */}
          {promptReason && !error && !message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <span>🌿</span>
              <span>{promptReason}</span>
            </div>
          )}

          {/* Messages */}
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

          {/* LOGIN FORM */}
          {step === 'login' && !otpSent && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="••••••••"
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
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('signup')
                  setEmail('')
                  setPassword('')
                  setName('')
                  setOtp('')
                  setOtpSent(false)
                  setError('')
                  setMessage('')
                }}
                className="w-full py-2.5 rounded-lg font-semibold text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                Sign Up with OTP
              </button>
            </form>
          )}

          {/* SIGNUP - STEP 1: SEND OTP */}
          {step === 'signup' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="••••••••"
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
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('login')
                  setEmail('')
                  setPassword('')
                  setName('')
                  setError('')
                  setMessage('')
                }}
                className="w-full py-2 text-center text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* SIGNUP - STEP 2: VERIFY OTP */}
          {step === 'signup' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP (6 digits)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-2.5 rounded-lg font-semibold text-white transition-colors ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
                }`}
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                  setError('')
                  setMessage('')
                }}
                className="w-full py-2 text-center text-sm text-gray-600 hover:text-gray-800"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {step === 'login' ? (
              <>
                New customer?{' '}
                <button
                  onClick={() => {
                    setStep('signup')
                    setEmail('')
                    setPassword('')
                    setName('')
                    setOtp('')
                    setOtpSent(false)
                    setError('')
                    setMessage('')
                  }}
                  className="text-[var(--color-primary)] hover:underline font-semibold"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setStep('login')
                    setEmail('')
                    setPassword('')
                    setName('')
                    setError('')
                    setMessage('')
                  }}
                  className="text-[var(--color-primary)] hover:underline font-semibold"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <Link
            to="/"
            className="block mt-6 text-center text-sm text-gray-500 hover:text-gray-700 border-t pt-6"
          >
            Continue as Guest →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
