import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/orderApi'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart, summary } = useCart()
  const { isLoggedIn, userInfo, loading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'COD',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [error, setError] = useState('')

  // Prefill form from logged in user profile
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || userInfo.name || '',
        email: prev.email || userInfo.email || '',
        phone: prev.phone || userInfo.phone || '',
      }))
    }
  }, [userInfo])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login', {
        state: {
          from: '/checkout',
          reason: 'Please sign in to complete your checkout and delivery details.',
        },
        replace: true,
      })
    }
  }, [isLoggedIn, loading, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')

    try {
      if (
        !formData.fullName.trim() ||
        !formData.phone.trim() ||
        !formData.street.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.postalCode.trim()
      ) {
        setError('Please fill in all required shipping address fields (Full Name, Phone, Street, City, State, Postal Code)')
        setIsProcessing(false)
        return
      }

      if (formData.paymentMethod !== 'COD') {
        setError('Online card & UPI payments are currently in integration mode. Please select Cash on Delivery (COD).')
        setIsProcessing(false)
        return
      }

      // Authoritative pricing: Send ONLY canonical product IDs and quantities
      const orderItems = cartItems.map((item) => ({
        productId: item._id || item.id,
        quantity: item.quantity,
      }))

      const orderData = {
        orderItems,
        shippingAddress: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim() || 'India',
        },
        paymentMethod: formData.paymentMethod,
        notes: `Customer Order - Payment Method: ${formData.paymentMethod}`,
      }

      const response = await createOrder(orderData)
      const result = response.data

      const createdOrder = result.order || result.data?.order

      if (!createdOrder || !createdOrder._id) {
        throw new Error('Order was placed but no valid Order ID was returned by the server.')
      }

      setOrderId(createdOrder._id)
      setPlacedOrder(createdOrder)
      setOrderPlaced(true)
      await clearCart()
    } catch (err) {
      setError(err.message || 'Failed to place order')
      console.error('Order placement error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-12 bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Thank you for choosing O2 Herbal Care</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded p-4 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">Confirmed Order ID:</p>
              <p className="font-mono font-bold text-lg text-emerald-700 break-all">{orderId}</p>
            </div>

            {/* Order Summary from server */}
            {placedOrder && (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4 text-left text-sm space-y-2">
                {placedOrder.totalAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Order Total</span>
                    <span className="font-bold text-[var(--color-primary)] text-base">
                      ₹{placedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Payment Method</span>
                  <span className="font-semibold text-gray-800">
                    {placedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : placedOrder.paymentMethod}
                  </span>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6 text-sm">
              Your order items, pricing, and stock have been verified and reserved on our secure server.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-orders')}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <h1 className="heading-font text-3xl text-[var(--color-primary)] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6 bg-white p-8 rounded-lg shadow">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] mt-4"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Address</h2>
                <textarea
                  name="street"
                  placeholder="Street Address / House No / Apartment *"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code / PIN *"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* COD */}
                  <label className="flex items-center justify-between p-4 border-2 border-[var(--color-primary)] bg-emerald-50/40 rounded-lg cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-semibold block text-gray-900">Cash on Delivery (COD)</span>
                        <span className="text-xs text-gray-600">Pay cash upon verified delivery at your doorstep</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                      Available
                    </span>
                  </label>

                  {/* Card (Coming Soon) */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-70 cursor-not-allowed">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CARD"
                        disabled
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium block text-gray-500">Credit / Debit Card</span>
                        <span className="text-xs text-gray-400">Visa, MasterCard, RuPay</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                      Coming Soon (Razorpay)
                    </span>
                  </div>

                  {/* UPI (Coming Soon) */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-70 cursor-not-allowed">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        disabled
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium block text-gray-500">UPI / QR Payment</span>
                        <span className="text-xs text-gray-400">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                      Coming Soon (Razorpay)
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-lg font-bold text-white text-lg transition-colors shadow-md ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
                }`}
              >
                {isProcessing ? 'Processing Order...' : 'Place Order (Cash on Delivery)'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Products List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id || item.id} className="flex justify-between items-start border-b pb-4">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown (Identical to Server Engine) */}
              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{summary.subtotal.toFixed(2)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Tier Discount</span>
                    <span className="font-medium">−₹{summary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-medium ${summary.shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Grand Total</span>
                  <span className="text-xl font-bold text-[var(--color-primary)]">₹{summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
