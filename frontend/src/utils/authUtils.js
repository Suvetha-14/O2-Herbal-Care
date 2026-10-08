// Helper for authenticated API calls
export function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// Protected fetch wrapper
export async function protectedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('token')
}

// Get current user info
export function getCurrentUser() {
  const user = localStorage.getItem('userInfo')
  return user ? JSON.parse(user) : null
}
