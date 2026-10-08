import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('userInfo')
    
    if (token && user) {
      setIsLoggedIn(true)
      setUserInfo(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(user))
    setIsLoggedIn(true)
    setUserInfo(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setIsLoggedIn(false)
    setUserInfo(null)
  }

  const getAuthToken = () => {
    return localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        userInfo, 
        loading, 
        handleLoginSuccess, 
        handleLogout,
        getAuthToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
