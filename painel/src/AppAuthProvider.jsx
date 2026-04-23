import { createContext, useContext, useState, useEffect } from 'react'
import { api } from './api/client'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mapdisc_token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('mapdisc_user')
    return u ? JSON.parse(u) : null
  })

  useEffect(() => {
    if (token && !user) {
      api.me().then(u => {
        setUser(u)
        localStorage.setItem('mapdisc_user', JSON.stringify(u))
      }).catch(() => {
        setToken(null)
        localStorage.removeItem('mapdisc_token')
        localStorage.removeItem('mapdisc_user')
      })
    }
  }, [])

  const login = (newToken, newUser) => {
    localStorage.setItem('mapdisc_token', newToken)
    localStorage.setItem('mapdisc_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('mapdisc_token')
    localStorage.removeItem('mapdisc_user')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}