import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { cartItems, removeFromCart, updateQuantity, summary, loading } = useCart()

  const discountTiers = [
    { label: 'Free Shipping', amount: 0, threshold: 0 },
    { label: 'SAVE50', amount: 50, threshold: 500 },
    { label: 'SAVE100', amount: 100, threshold: 1000 },
    { label: 'SAVE150', amount: 150, threshold: 1500 },
    { label: 'SAVE200', amount: 200, threshold: 2000 },
  ]

  const maxThreshold = 2000
  const progressPercentage = Math.min((summary.subtotal / maxThreshold) * 100, 100)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-secondary)]">Loading your cart…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="mb-8">
          <p className="eyebrow mb-2">Almost There</p>
          <h1 className="heading-font text-3xl text-[var(--color-primary)]">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4 animate-floatSlow">🛒</span>
            <p className="text-2xl text-gray-700 mb-2">Your cart is empty</p>
            <p className="text-gray-500 mb-6">Fill it with something nature made just for you.</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemId = item._id || item.id
                return (
                  <div key={itemId} className="card-surface p-6 flex gap-6 hover:-translate-y-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl ring-1 ring-black/5"
                    />

                    <div className="flex-1">
                      <h3 className="heading-font text-lg text-[var(--color-primary)] mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                      <div className="text-lg font-bold text-[var(--color-primary)]">₹{item.price}</div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => updateQuantity(itemId, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(itemId, Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right mb-4">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-[var(--color-primary)]">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column - Discount Tiers & Order Summary */}
            <div className="h-fit sticky top-24 space-y-6">
              {/* Discount Tiers Progress */}
              <div className="card-surface hover:translate-y-0 p-6 space-y-6">
                <h3 className="font-semibold text-[var(--color-primary)] mb-4">Unlock Discounts</h3>

                {/* Progress Bar */}
                <div className="space-y-4">
                  <div className="relative h-8">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-green-500 transform -translate-y-1/2 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>

                    <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between">
                      {discountTiers.map((tier, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              summary.subtotal >= tier.threshold
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}
                          >
                            {summary.subtotal >= tier.threshold ? '✓' : '•'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Labels */}
                  <div className="flex justify-between text-xs pt-2">
                    {discountTiers.map((tier, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className={`font-semibold ${
                            summary.subtotal >= tier.threshold ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {tier.label}
                        </div>
                        <div className="text-gray-600">₹{tier.threshold}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {summary.discount > 0 && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">You're saving ₹{summary.discount}!</span>
                    </p>
                  </div>
                )}
                {summary.subtotal < 500 && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Add ₹{500 - summary.subtotal} more to get ₹50 discount & free shipping
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-[var(--color-cream)] rounded-2xl shadow-soft p-6 space-y-6">
                <h2 className="text-xl font-bold text-[var(--color-primary)]">Order Summary</h2>

                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{summary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-semibold ${summary.shipping === 0 ? 'text-green-600' : ''}`}>
                      {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping}`}
                    </span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">−₹{summary.discount}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold text-[var(--color-primary)]">
                  <span>Total</span>
                  <span>₹{summary.total.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate('/login', {
                        state: {
                          from: '/checkout',
                          reason: 'Please sign in to proceed with delivery and complete your order.',
                        },
                      })
                    } else {
                      navigate('/checkout')
                    }
                  }}
                  className="btn-primary w-full !py-3 font-bold"
                >
                  Proceed to Checkout
                </button>

                <button onClick={() => navigate('/products')} className="btn-outline w-full">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
