import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

let toastId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast])
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast])
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lift border text-sm font-medium transition-all duration-300 animate-fadeUp ${
              t.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : t.type === 'error'
                ? 'bg-red-800 text-white border-red-700'
                : 'bg-[var(--color-primary)] text-white border-[var(--color-secondary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {t.type === 'success' ? '🌿' : t.type === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/70 hover:text-white text-base leading-none p-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastNotification() {
  const context = useContext(ToastContext)
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      showToast: (m) => console.log('[Toast]', m),
      success: (m) => console.log('[Toast Success]', m),
      error: (m) => console.error('[Toast Error]', m),
      info: (m) => console.log('[Toast Info]', m),
      removeToast: () => {},
    }
  }
  return context
}
