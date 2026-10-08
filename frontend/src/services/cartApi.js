import apiClient from './apiClient'

export const getCart = () => apiClient.get('/cart')

export const addToCart = (productId, quantity = 1) =>
  apiClient.post('/cart/add', { productId, quantity })

export const updateCartItem = (productId, quantity) =>
  apiClient.put(`/cart/update/${productId}`, { quantity })

export const removeCartItem = (productId) =>
  apiClient.delete(`/cart/remove/${productId}`)

export const clearCart = () => apiClient.delete('/cart/clear')

export const mergeGuestCart = (items) =>
  apiClient.post('/cart/merge', { items })

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
}
