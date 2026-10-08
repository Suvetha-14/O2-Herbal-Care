import apiClient from './apiClient'

export const createOrder = (orderData) => apiClient.post('/orders', orderData)

export const getUserOrders = () => apiClient.get('/orders/user')

export const getOrderById = (id) => apiClient.get(`/orders/${id}`)

export default {
  createOrder,
  getUserOrders,
  getOrderById,
}
