import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminStats, getAllOrders } from '../services/adminApi'
import { LoadingSpinner, EmptyState } from '../components/Common'
import AdminLayout from '../components/AdminLayout'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function Dashboard() {
  const { admin, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin')
      return
    }
    if (!loading && admin) {
      fetchDashboardData()
    }
  }, [loading, admin, navigate])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getAllOrders(),
      ])

      setStats(statsRes.data.stats)
      setOrders(ordersRes.data.orders || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: '💰', color: 'green' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'blue' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: 'yellow' },
    { title: 'Delivered Orders', value: stats?.deliveredOrders || 0, icon: '✓', color: 'green' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: '👥', color: 'purple' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: 'blue' },
    { title: 'Active Products', value: stats?.activeProducts || 0, icon: '✨', color: 'green' },
    { title: 'Low Stock Items', value: stats?.lowStockProducts || 0, icon: '⚠️', color: 'red' },
  ]

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                card.color === 'blue'
                  ? 'border-blue-500'
                  : card.color === 'green'
                  ? 'border-green-500'
                  : card.color === 'purple'
                  ? 'border-purple-500'
                  : card.color === 'yellow'
                  ? 'border-yellow-500'
                  : 'border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              View All Orders →
            </button>
          </div>

          {orders.length === 0 ? (
            <EmptyState message="No orders placed yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-xs font-mono font-semibold">{order._id}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
