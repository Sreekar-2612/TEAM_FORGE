import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* =========================
   AXIOS INSTANCE
   ========================= */
const api = axios.create({
  baseURL: API_URL,
});

/* =========================
   AUTH INTERCEPTOR
   ========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

/* =========================
   AUTH API
   ========================= */
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

/* =========================
   USER API
   ========================= */
export const userAPI = {
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/me', data),
  getUser: (id) => api.get(`/user/${id}`),
};

/* =========================
   MATCHING API
   ========================= */
export const matchingAPI = {
  getCandidates: () => api.get('/matches/candidates'),
  swipe: (targetId, type) =>
    api.post('/matches/swipe', { targetId, type }),
};

/* =========================
   CHAT API  ✅ (THIS FIXES YOUR ERROR)
   ========================= */
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, params) =>
    api.get(`/chat/messages/${conversationId}`, { params }),
  getMatches: () => api.get('/chat/matches'),
};

/* =========================
   AI API (OPENROUTER)
   ========================= */
export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
};

export const matchAPI = {
  getRequests: () => api.get('/chat/requests'),
  getPending: () => api.get('/chat/pending'),
};

export default api;
