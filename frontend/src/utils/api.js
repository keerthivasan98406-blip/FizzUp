import axios from 'axios';

// Same domain in production (backend serves frontend)
// Vite proxy handles /api in development
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('fizzup_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fizzup_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
