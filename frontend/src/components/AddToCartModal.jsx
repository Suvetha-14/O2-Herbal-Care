import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { getProducts } from '../services/productApi'
import { useToastNotification } from '../context/ToastContext'

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f4f6f0"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="36" fill="%232d6a4f">🌿</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2352796f">O2 Herbal Care</text></svg>'

export default function AddToCartModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [recommendations, setRecommendations] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const { addToCart } = useCart()
  const { success: toastSuccess } = useToastNotification()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')

  const getNewRecommendation = () => {
    const selectedIds = selectedProducts.map((item) => item.product._id || item.product.id)
    const availableProducts = allProducts.filter(
      (p) =>
        p.category !== product.category &&
        (p._id || p.id) !== (product._id || product.id) &&
        !selectedIds.includes(p._id || p.id) &&
        !recommendations.some((rec) => (rec._id || rec.id) === (p._id || p.id))
    )
    if (availableProducts.length === 0) return null
    return availableProducts[Math.floor(Math.random() * availableProducts.length)]
  }

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      try {
        const res = await getProducts()
        if (!mounted) return
        const list = res.data?.products || []
        setAllProducts(list)

        if (isOpen && product) {
          const otherProducts = list.filter(
            (p) => p.category !== product.category && (p._id || p.id) !== (product._id || product.id)
          )
          const randomized = otherProducts.sort(() => Math.random() - 0.5).slice(0, 3)
          setRecommendations(randomized)
          setQuantity(1)
          setSelectedProducts([])
        }
      } catch (err) {
        console.warn('Failed to load recommendations', err.message)
      }
    }

    if (isOpen) {
      setError('')
      setIsAdding(false)
      fetchProducts()
    }
    return () => {
      mounted = false
    }
  }, [isOpen, product])

  const handleAddToCart = async () => {
    setIsAdding(true)
    setError('')

    try {
      await addToCart(product, quantity)
      for (const item of selectedProducts) {
        await addToCart(item.product, item.quantity)
      }

      const totalAdded = quantity + selectedProducts.reduce((sum, item) => sum + item.quantity, 0)
      toastSuccess(`Added ${totalAdded} item${totalAdded > 1 ? 's' : ''} to cart!`)

      setQuantity(1)
      setSelectedProducts([])
      onClose()
    } catch (err) {
      console.error('Add to cart error:', err)
      setError(err.message || 'Unable to add to cart. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddRecommendation = (rec) => {
    const recId = rec._id || rec.id
    setSelectedProducts((prev) => {
      const existing = prev.find((item) => (item.product._id || item.product.id) === recId)
      if (existing) {
        return prev.map((item) =>
          (item.product._id || item.product.id) === recId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product: rec, quantity: 1 }]
    })

    const newRec = getNewRecommendation()
    if (newRec) {
      setRecommendations((prev) => {
        const filtered = prev.filter((r) => (r._id || r.id) !== recId)
        return [...filtered, newRec]
      })
    }
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => (item.product._id || item.product.id) !== productId)
    )
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId)
    } else {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          (item.product._id || item.product.id) === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    }
  }

  if (!isOpen || !product) return null

  const mainImage = product.image || (product.images && product.images[0]) || FALLBACK_IMAGE

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lift max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeUp">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b flex items-center justify-between p-6 rounded-t-2xl z-10">
          <h2 className="heading-font text-2xl text-[var(--color-primary)]">Add to Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:rotate-90 transition-all duration-300 text-2xl leading-none p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Selected Item
            </h3>
            <div className="space-y-4">
              {/* Main product */}
              <div className="bg-white p-4 rounded-xl border flex gap-4 items-center">
                <img
                  src={mainImage}
                  alt={product.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE
                  }}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--color-primary)] truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <p className="text-base font-bold text-[var(--color-primary)] mt-0.5">₹{product.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Selected recommended products */}
              {selectedProducts.map((item) => {
                const recId = item.product._id || item.product.id
                const recImg = item.product.image || (item.product.images && item.product.images[0]) || FALLBACK_IMAGE
                return (
                  <div key={recId} className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex gap-4 items-center">
                    <img
                      src={recImg}
                      alt={item.product.name}
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE
                      }}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--color-primary)] truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">{item.product.category}</p>
                      <p className="text-base font-bold text-[var(--color-primary)] mt-0.5">₹{item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(recId, item.quantity - 1)}
                          className="w-7 h-7 rounded bg-white hover:bg-gray-100 border text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(recId, item.quantity + 1)}
                          className="w-7 h-7 rounded bg-white hover:bg-gray-100 border text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(recId)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold px-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
            >
              {isAdding ? 'Adding to Cart…' : `Add to Cart • ₹${product.price * quantity + selectedProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}`}
            </button>

            <button
              onClick={onClose}
              className="btn-outline w-full !border-gray-200 !text-gray-600 hover:!bg-gray-100 hover:!text-gray-900"
            >
              Continue Shopping
            </button>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Pair With Herbal Favourites
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec) => {
                  const recId = rec._id || rec.id
                  const recImg = rec.image || (rec.images && rec.images[0]) || FALLBACK_IMAGE
                  return (
                    <div
                      key={recId}
                      className="bg-[var(--color-cream)] p-3.5 rounded-xl border border-transparent hover:border-[var(--color-accent)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <img
                        src={recImg}
                        alt={rec.name}
                        onError={(e) => {
                          if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE
                        }}
                        className="w-full h-24 object-cover rounded-lg mb-2 border"
                      />
                      <h4 className="font-semibold text-xs text-[var(--color-primary)] truncate mb-0.5">
                        {rec.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mb-2 truncate">{rec.category}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-xs">₹{rec.price}</span>
                        <button
                          onClick={() => handleAddRecommendation(rec)}
                          className="bg-[var(--color-gold)] text-[var(--color-ink)] px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
