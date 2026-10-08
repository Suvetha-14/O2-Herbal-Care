import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderById, updateOrderStatus } from '../services/adminApi'
import AdminLayout from '../components/AdminLayout'
import useToast from '../hooks/useToast'
import { Toast, LoadingSpinner } from '../components/Common'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function EditOrder() {
  const { admin, loading } = useAdminAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin')
      return
    }
    if (!loading && admin) {
      fetchOrder()
    }
  }, [id, loading, admin, navigate])

  const fetchOrder = async () => {
    try {
      const response = await getOrderById(id)
      const orderData = response.data.order
      setOrder(orderData)
      setOrderStatus(orderData.orderStatus)
      setPaymentStatus(orderData.paymentStatus)
    } catch (error) {
      addToast('Failed to fetch order', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await updateOrderStatus(id, {
        orderStatus,
        paymentStatus,
      })
      addToast('Order updated successfully', 'success')
      
      setTimeout(() => {
        navigate('/admin/orders')
      }, 1000)
    } catch (error) {
      addToast('Failed to update order', 'error')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500 text-lg">Order not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Order ID</p>
                  <p className="font-mono font-bold text-lg">{order._id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Order Date</p>
                  <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="font-bold text-2xl text-green-600">₹{order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Status</p>
                  <p
                    className={`font-semibold px-3 py-1 rounded-full text-sm inline-block ${
                      order.paymentStatus === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="font-medium">{order.user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{order.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                <p className="text-gray-700">
                  {order.shippingAddress.fullName && (
                    <>
                      <strong>{order.shippingAddress.fullName}</strong>
                      <br />
                    </>
                  )}
                  {order.shippingAddress.street || order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode || order.shippingAddress.pincode}
                  <br />
                  {order.shippingAddress.country || 'India'}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 font-semibold text-gray-700">Product</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.productName || 'Product'}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">₹{item.price}</td>
                      <td className="text-right py-3 font-semibold">₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Update Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Failed</option>
                  <option>Refunded</option>
                </select>
              </div>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AdminLayout>
  )
}
