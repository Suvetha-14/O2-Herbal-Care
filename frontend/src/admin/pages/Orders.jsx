import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllOrders } from '../services/adminApi'
import { LoadingSpinner, EmptyState, Toast } from '../components/Common'
import AdminLayout from '../components/AdminLayout'
import useToast from '../hooks/useToast'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function Orders() {
  const { admin, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin')
      return
    }
    if (!loading && admin) {
      fetchOrders()
    }
  }, [loading, admin, navigate])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await getAllOrders()
      setOrders(response.data.orders || [])
    } catch (error) {
      addToast('Failed to fetch orders', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchSearch = 
      order._id.includes(searchTerm) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filterStatus === 'All' || order.orderStatus === filterStatus
    
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>All</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredOrders.length === 0 ? (
          <EmptyState message="No orders found" />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-600">
                      {order._id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.user?.name}</p>
                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {order.orderItems?.length || 0} items
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.orderStatus === 'Processing'
                            ? 'bg-blue-100 text-blue-700'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/edit-order/${order._id}`}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AdminLayout>
  )
}
