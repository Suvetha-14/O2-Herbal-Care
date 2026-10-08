import apiClient from './apiClient'

export const getProducts = (params = {}) => apiClient.get('/products', { params })
export const getProductById = (id) => apiClient.get(`/products/${id}`)
export const addProductReview = (id, reviewData) => apiClient.post(`/products/${id}/review`, reviewData)
export const deleteProductReview = (productId, reviewId) => apiClient.delete(`/products/${productId}/review/${reviewId}`)

export default apiClient
