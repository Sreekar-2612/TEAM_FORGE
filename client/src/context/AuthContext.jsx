import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  /* -------------------------------
     LOAD USER ON TOKEN
  -------------------------------- */
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     AUTH ACTIONS
  -------------------------------- */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);

      await loadUser();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const response = await authAPI.signup({ fullName, email, password });
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);

      await loadUser();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
    } catch {
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
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
