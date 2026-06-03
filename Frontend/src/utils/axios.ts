import axios from 'axios';

/**
 * Shared API client. Every request automatically:
 *  - targets VITE_API_BASE_URL
 *  - attaches the Bearer token from localStorage
 *  - on a 401, clears the session and redirects to /auth
 *
 * All app code should import this instance instead of calling `axios`/`fetch`
 * directly, so auth and error handling stay consistent.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/login');

    // Session expired / invalid token — clear and bounce to sign-in.
    // Skip for the login call itself so the form can show "invalid credentials".
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
