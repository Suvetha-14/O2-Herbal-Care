import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSubmitted(true)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      {submitted ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">🌿</span>
          <h4 className="font-bold text-[var(--color-primary)] text-lg mb-1">Message Sent!</h4>
          <p className="text-sm text-gray-600 mb-4">
            Thank you for reaching out to O2 Herbal Care. Our team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold text-[var(--color-primary)] underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm"
              placeholder="e.g. Suvetha"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm"
              placeholder="e.g. suvetha@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm"
              placeholder="How can we help your skin or hair care journey?"
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors text-sm shadow-soft"
            >
              Send Message
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
