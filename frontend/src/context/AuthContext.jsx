import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const base64Std = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      base64.length + (4 - (base64.length % 4)) % 4, '='
    )
    return JSON.parse(atob(base64Std))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('sp_token')
    if (storedToken) {
      const payload = decodeJwtPayload(storedToken)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser(payload)
      } else {
        localStorage.removeItem('sp_token')
      }
    }
    setLoading(false)
  }, [])          // ← runs ONCE on mount only

  function login(newToken, userData) {
    localStorage.setItem('sp_token', newToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('sp_token')
    setUser(null)
  }

  const isAdmin = ['admin', 'super_admin', 'content_admin'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
