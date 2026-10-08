import { useState, useRef, useEffect } from 'react'
import ChatProductCard from './ChatProductCard'
import { sendChatMessage } from '../services/chatbotApi'

const INITIAL_SUGGESTIONS = [
  'Best product for hair fall?',
  'What helps with acne?',
  'Do you have a moisturizer?',
  'What is your return policy?',
]

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

let idCounter = 1
function nextId() {
  idCounter += 1
  return idCounter
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-[var(--color-accent)]/40 px-3 py-2.5 rounded-2xl rounded-bl-sm w-fit">
      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" />
    </div>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      sender: 'bot',
      text: "Hi! I'm Sprout 🌿, your O2 Herbal Care shopping assistant. Ask me about our products, ingredients, or skin & hair concerns — I'm happy to help!",
      timestamp: new Date(),
      products: [],
    },
  ])
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS)
  const [userInput, setUserInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isBotTyping])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const pushMessage = (msg) => {
    setMessages((prev) => [...prev, msg])
    if (!isOpen && msg.sender === 'bot') setHasUnread(true)
  }

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? userInput).trim()
    if (!text || isBotTyping) return

    const userMsg = { id: nextId(), sender: 'user', text, timestamp: new Date(), products: [] }
    const history = [...messages, userMsg]
      .slice(-9)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'bot', content: m.text }))

    setMessages((prev) => [...prev, userMsg])
    setUserInput('')
    setSuggestions([])
    setIsBotTyping(true)

    try {
      const res = await sendChatMessage(text, history)
      const { reply, products = [], suggestions: newSuggestions = [] } = res.data

      pushMessage({
        id: nextId(),
        sender: 'bot',
        text: reply,
        timestamp: new Date(),
        products,
      })
      setSuggestions(newSuggestions.length ? newSuggestions : INITIAL_SUGGESTIONS)
    } catch (err) {
      console.error('Chatbot error:', err)
      pushMessage({
        id: nextId(),
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        products: [],
      })
      setSuggestions(INITIAL_SUGGESTIONS)
    } finally {
      setIsBotTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 h-[30rem] sm:h-[32rem] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-[var(--color-accent)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">
                🌿
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">Sprout</h3>
                <p className="text-[var(--color-accent)] text-[11px] leading-tight">O2 Herbal Shopping Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f6f8f5] space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[var(--color-primary)] text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>

                {msg.products && msg.products.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mt-2 pb-1 w-full scrollbar-hide">
                    {msg.products.map((p) => (
                      <ChatProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isBotTyping && (
              <div className="flex flex-col items-start">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {suggestions.length > 0 && !isBotTyping && (
            <div className="px-3 pt-2 pb-2 bg-[#f6f8f5] border-t border-gray-100 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3 py-1.5 text-xs bg-white border border-[var(--color-accent)] text-[var(--color-primary)] rounded-full whitespace-nowrap hover:bg-[var(--color-accent)]/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about products, skin & hair care..."
                disabled={isBotTyping}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 focus:border-[var(--color-secondary)] disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isBotTyping}
                aria-label="Send message"
                className="bg-[var(--color-primary)] text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle chat"
        className="relative bg-[var(--color-primary)] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:bg-[var(--color-secondary)] transition-all duration-200"
      >
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
