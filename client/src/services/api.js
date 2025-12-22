import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-auth-token'] = token
  }
  return config
})

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
}

// User API
export const userAPI = {
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/me', data),
  getUser: (id) => api.get(`/user/${id}`)
}

// Matching API
export const matchingAPI = {
  getCandidates: () => api.get('/matches/candidates'),
  swipe: (targetId, type) => api.post('/matches/swipe', { targetId, type })
}

export default api

