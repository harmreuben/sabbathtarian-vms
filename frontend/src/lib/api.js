import axios from 'axios';

// Use Vite environment variable for the API URL.
// Fallback to localhost for local development if the env variable is missing.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// Request Interceptor: Attach JWT Token
// ==========================================
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth');
    if (authStorage) {
      try {
        const { access } = JSON.parse(authStorage);
        if (access) {
          config.headers.Authorization = `Bearer ${access}`;
        }
      } catch {
        // Ignore malformed JSON in localStorage
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response Interceptor: Auto-Refresh Token
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops
      
      try {
        const authStorage = localStorage.getItem('auth');
        if (!authStorage) throw new Error('No authentication data found');
        
        const { refresh } = JSON.parse(authStorage);
        if (!refresh) throw new Error('No refresh token available');

        // Attempt to get a new access token using the refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refresh,
        });
        
        const newAccessToken = response.data.access;
        const currentAuth = JSON.parse(authStorage);
        
        // Save the new access token to localStorage
        localStorage.setItem('auth', JSON.stringify({ ...currentAuth, access: newAccessToken }));
        
        // Update the failed request's header and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // If refreshing fails (e.g., refresh token expired), force logout
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;