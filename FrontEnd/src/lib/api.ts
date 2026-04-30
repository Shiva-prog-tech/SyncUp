const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('syncup_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body: object) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body: object) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Posts
  getPosts: (page = 1) => request(`/posts?page=${page}&limit=10`),
  createPost: (body: object) => request('/posts', { method: 'POST', body: JSON.stringify(body) }),
  likePost: (id: string) => request(`/posts/${id}/like`, { method: 'PUT' }),
  commentPost: (id: string, content: string) => request(`/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),
  deletePost: (id: string) => request(`/posts/${id}`, { method: 'DELETE' }),

  // Messages
  getConversations: () => request('/messages/conversations'),
  getMessages: (userId: string) => request(`/messages/${userId}`),
  sendMessage: (userId: string, text: string) => request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ text }) }),
  searchUsers: (q: string) => request(`/messages/users/search?q=${encodeURIComponent(q)}`),

  // Notifications
  getNotifications: () => request('/notifications'),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Users
  getUsers: () => request('/users'),
  getUser: (id: string) => request(`/users/${id}`),
  connect: (id: string) => request(`/users/${id}/connect`, { method: 'POST' }),
};
