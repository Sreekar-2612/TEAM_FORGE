import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

/* =========================
   USER API
========================= */
export const userAPI = {
  getProfile: () => api.get('/api/user/me'),
  updateProfile: (data) => api.put('/api/profile/me', data),
  getUser: (id) => api.get(`/api/user/${id}`),
};

/* =========================
   MATCHING API
========================= */
export const matchingAPI = {
  getCandidates: () => api.get('/api/matches/candidates'),
  swipe: (targetId, type) =>
    api.post('/api/matches/swipe', { targetId, type }),
};

/* =========================
   CHAT API
========================= */
export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (conversationId, params) =>
    api.get(`/api/chat/messages/${conversationId}`, { params }),
  getMatches: () => api.get('/api/chat/matches'),
};

/* =========================
   MATCH REQUEST API
========================= */
export const matchAPI = {
  getRequests: () => api.get('/api/chat/requests'),
  getPending: () => api.get('/api/chat/pending'),
};

/* =========================
   PROFILE API
========================= */
export const profileAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    return api.post('/api/profile/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};



export const teamAPI = {
  createTeam: (data) => api.post('/api/teams', data),
  getMyTeams: () => api.get('/api/teams/mine'),
  leaveTeam: (teamId) => api.post(`/api/teams/${teamId}/leave`),
  joinTeam: (token) => api.post(`/api/teams/join/${token}`),
  getTeamMessages: (teamId) =>
    api.get(`/api/teams/${teamId}/messages`),
  updateCapacity: (teamId, maxMembers) =>
    api.put(`/api/teams/${teamId}/capacity`, { maxMembers }),
  joinByInvite: (token) => api.post(`/api/teams/join/${token}`),
  getTeam: (teamId) => api.get('/api/teams/mine').then(res =>
    res.data.find(t => t._id === teamId)
  ),
  /* 🔽 NEW */
  inviteUser: (teamId, userId) =>
    api.post(`/api/teams/${teamId}/invite`, { userId }),

  getPendingInvites: (teamId) =>
    api.get(`/api/teams/${teamId}/invites`),

  approveInvite: (teamId, userId) =>
    api.post(`/api/teams/${teamId}/invites/${userId}/approve`),

  rejectInvite: (teamId, userId) =>
    api.post(`/api/teams/${teamId}/invites/${userId}/reject`),
  // 🔑 INVITES
  getMatchedUsers: (teamId) =>
    api.get(`/api/teams/${teamId}/matched-users`),
};



/* =========================
   TEAM PROJECT API
========================= */
export const teamProjectAPI = {
  getProject: (teamId) =>
    api.get(`/api/team-projects/${teamId}`),

  addTask: (teamId, data) =>
    api.post(`/api/team-projects/${teamId}/tasks`, data),

  updateStatus: (teamId, taskId, data) =>
    api.patch(`/api/team-projects/${teamId}/tasks/${taskId}/status`, data),

  updateProgress: (teamId, taskId, progress) =>
    api.patch(`/api/team-projects/${teamId}/tasks/${taskId}/progress`, {
      progress,
    }),

  updateColor: (teamId, taskId, color) =>
    api.patch(`/api/team-projects/${teamId}/tasks/${taskId}/color`, {
      color,
    }),

  deleteTask: (teamId, taskId) =>
    api.delete(`api/team-projects/${teamId}/tasks/${taskId}`),
};





/* =========================
   AI API (OPENROUTER)
========================= */
export const aiAPI = {
  chat: (messages) => api.post('/api/ai/chat', { messages }),
};

export default api;
