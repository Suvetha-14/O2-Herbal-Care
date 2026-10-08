import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('adminToken')
    const adminEmail = localStorage.getItem('adminEmail')
    
    if (token && adminEmail) {
      setAdmin({ email: adminEmail, token })
    }
    setLoading(false)
  }, [])

  const login = (email, token) => {
    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminEmail', email)
    setAdmin({ email, token })
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
