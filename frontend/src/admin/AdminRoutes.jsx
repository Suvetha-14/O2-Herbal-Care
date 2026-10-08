import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
import AdminLogin from '../pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Orders from './pages/Orders'
import EditOrder from './pages/EditOrder'
import Sliders from './pages/Sliders'
import { LoadingSpinner } from './components/Common'

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!admin) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <ProtectedRoute>
        <Products />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/add-product',
    element: (
      <ProtectedRoute>
        <AddProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/edit-product/:id',
    element: (
      <ProtectedRoute>
        <EditProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/edit-order/:id',
    element: (
      <ProtectedRoute>
        <EditOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/slides',
    element: (
      <ProtectedRoute>
        <Sliders />
      </ProtectedRoute>
    ),
  },
]
