import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/orderApi'

export default function MyOrders() {
  const navigate = useNavigate()
  const { isLoggedIn, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login')
      return
    }

    if (isLoggedIn) {
      fetchUserOrders()
    }
  }, [isLoggedIn, loading, navigate])

  const fetchUserOrders = async () => {
    try {
      setFetching(true)
      setError('')
      const res = await getUserOrders()
      setOrders(res.data?.orders || [])
    } catch (err) {
      setError(err.message || 'Could not load orders')
    } finally {
      setFetching(false)
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-secondary)]">Loading your order history…</p>
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
        <div className="mb-8">
          <p className="eyebrow mb-2">Order History</p>
          <h1 className="heading-font text-3xl text-[var(--color-primary)]">My Orders</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
            <span className="text-5xl block mb-4">📦</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders placed yet</h2>
            <p className="text-gray-500 mb-6">Explore our catalog and experience pure herbal care.</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Order ID</span>
                    <span className="font-mono font-bold text-gray-900">{order._id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Date</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Status</span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.orderStatus === 'Shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Total</span>
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                      ₹{Number(
                        typeof order.totalAmount === 'number' && order.totalAmount > 0
                          ? order.totalAmount
                          : (order.orderItems || []).reduce(
                              (sum, item) =>
                                sum +
                                (Number(item.totalPrice) ||
                                  Number(item.price) * Number(item.quantity) ||
                                  0),
                              0
                            ) +
                            (Number(order.shippingPrice) || 0) -
                            (Number(order.discountAmount) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</h4>
                    {order.orderItems?.map((item, idx) => {
                      const pImg =
                        item.product?.image ||
                        (item.product?.images && item.product.images[0]) ||
                        ''
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                          {pImg && (
                            <img
                              src={pImg}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-800">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <span className="font-semibold text-sm text-gray-900">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Address & Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-xs text-gray-600">
                    <div>
                      <h4 className="font-bold text-gray-800 uppercase tracking-wider mb-1">Shipping To</h4>
                      <p className="font-semibold text-gray-900">{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
                      <p>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}
                      </p>
                      {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
                      <p>Phone: {order.shippingAddress?.phone}</p>
                    </div>
                    <div className="border-t pt-2">
                      <h4 className="font-bold text-gray-800 uppercase tracking-wider mb-1">Payment Method</h4>
                      <p className="font-semibold text-gray-900">{order.paymentMethod || 'COD'}</p>
                      <p>Payment Status: <span className="font-semibold">{order.paymentStatus || 'Pending'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
