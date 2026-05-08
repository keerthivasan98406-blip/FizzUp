import axios from 'axios';

// In production on Render, backend and frontend are the SAME service
// So /api works directly. But if separate, use VITE_API_URL env var.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('fizzup_user');
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {}
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
