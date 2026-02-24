const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('anamnez_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (token) => request(`/api/auth/verify-email?token=${token}`),
  resendVerification: (email) => request('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),

  // Profile
  getMe: () => request('/api/profile/me'),
  updateMe: (body) => request('/api/profile/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getProfile: (username) => request(`/api/profile/${username}`),
  getLeaderboard: () => request('/api/profile/leaderboard/top'),

  // Feed
  getFeed: (section = 'feed', page = 1) => request(`/api/feed?section=${section}&page=${page}`),
  createPost: (body) => request('/api/feed', { method: 'POST', body: JSON.stringify(body) }),
  likePost: (id) => request(`/api/feed/${id}/like`, { method: 'POST' }),
  deletePost: (id) => request(`/api/feed/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: (postId) => request(`/api/comments/${postId}`),
  createComment: (postId, body) => request(`/api/comments/${postId}`, { method: 'POST', body: JSON.stringify(body) }),
  likeComment: (id) => request(`/api/comments/${id}/like`, { method: 'POST' }),

  // Messages
  getConversations: () => request('/api/messages/conversations'),
  getMessages: (convId) => request(`/api/messages/${convId}`),
  startConversation: (target_user_id) => request('/api/messages/start', { method: 'POST', body: JSON.stringify({ target_user_id }) }),
  sendMessage: (convId, content) => request(`/api/messages/${convId}/send`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Cases
  getCases: (difficulty, page = 1) => request(`/api/cases?${difficulty ? `difficulty=${difficulty}&` : ''}page=${page}`),
  getDailyCase: () => request('/api/cases/daily'),
  getCase: (id) => request(`/api/cases/${id}`),
  answerCase: (id, option_id) => request(`/api/cases/${id}/answer`, { method: 'POST', body: JSON.stringify({ option_id }) }),
};
