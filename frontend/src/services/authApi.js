import apiClient from './apiClient'

export const loginUser = (credentials) => apiClient.post('/users/login', credentials)

export const sendOtp = (identifier) => apiClient.post('/users/send-otp', { identifier })

export const verifyOtp = (payload) => apiClient.post('/users/verify-otp', payload)

export const getProfile = () => apiClient.get('/users/profile')

export const getCurrentUser = () => apiClient.get('/users/me')

export const forgotPassword = (email) => apiClient.post('/users/forgot-password', { email })

export const resetPassword = (payload) => apiClient.post('/users/reset-password', payload)

export default {
  loginUser,
  sendOtp,
  verifyOtp,
  getProfile,
  getCurrentUser,
  forgotPassword,
  resetPassword,
}
