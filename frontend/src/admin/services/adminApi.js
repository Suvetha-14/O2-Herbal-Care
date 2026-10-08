import axios from 'axios'
import API_BASE_URL from '../../config/apiConfig'

const API = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const loginAdmin = (email, password) => API.post('/admin/login', { email, password })

// Products
export const getAllProducts = () => API.get('/admin/products')
export const getProductById = (id) => API.get(`/products/${id}`)
export const createProduct = (data) => API.post('/admin/products', data)
export const updateProduct = (id, data) => API.put(`/admin/products/${id}`, data)
export const deleteProduct = (id, hard = false) => API.delete(`/admin/products/${id}${hard ? '?hard=true' : ''}`)

// Sliders
export const getAllSliders = () => API.get('/admin/sliders')
export const createSlider = (data) => API.post('/admin/sliders', data)
export const updateSlider = (id, data) => API.put(`/admin/sliders/${id}`, data)
export const deleteSlider = (id) => API.delete(`/admin/sliders/${id}`)

// Orders
export const getAllOrders = () => API.get('/admin/orders')
export const getOrderById = (id) => API.get(`/orders/${id}`)
export const updateOrderStatus = (id, data) => API.put(`/admin/orders/${id}`, data)

// Stats
export const getAdminStats = () => API.get('/admin/stats')

// Reviews
export const getProductReviews = (productId) => API.get(`/products/${productId}`)

export default API
