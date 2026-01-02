import { createContext, useContext, useState, useEffect } from 'react'
import { connectSocket, disconnectSocket } from '../services/socket';
import { authAPI, userAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      connectSocket();
      loadUser();
    } else {
      disconnectSocket();
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await userAPI.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to load user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      await loadUser();
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const signup = async (fullName, email, password) => {
    try {
      const response = await authAPI.signup({ fullName, email, password })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      await loadUser();
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      }
    }
  }

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };
  
  const updateUser = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
    } catch (e) {
      logout();
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    updateUser,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

