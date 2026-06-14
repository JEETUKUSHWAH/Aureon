import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000,
  withCredentials: true,
})

// ── Request Interceptor: attach JWT ──────────────────────
api.interceptors.request.use(
  (config) => {
    console.log('Interpreting request to:', config.url)
    try {
      const stored = localStorage.getItem('auth')
      console.log('Stored auth data:', stored)
      if (stored) {
        const authData = JSON.parse(stored)
        console.log('Parsed auth data:', authData)
        const token = authData.accessToken || authData.token || authData.jwt
        if (token) {
          console.log(`Attaching token to ${config.url}`)
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('No security token found in stored auth')
        }
      } else {
        console.warn('No auth found in localStorage')
      }
      console.log('Final request headers:', config.headers)
    } catch (e) {
      console.error('Error parsing auth for token:', e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor: handle 401 & Auto-Logout ────────────────────
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
      if (window.location.pathname !== '/login') {
        isLoggingOut = true;
        console.warn('Access token expired or invalid. Triggering auto-logout...');
        
        try {
          // Attempt to notify backend (optional, might fail if token is dead)
          await axios.post('/api/auth/logout', {}, { withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        } catch (e) {
          console.log('Backend logout failed or was unnecessary (token already invalid).');
        } finally {
          // Mandatory Frontend Cleanup
          localStorage.removeItem('auth')
          isLoggingOut = false
          window.location.href = '/login?expired=true'
        }
      }
    }
    return Promise.reject(error);
  }
)

export default api
