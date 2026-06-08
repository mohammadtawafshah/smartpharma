import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost/smartpharma-api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const status = err.response?.status

    // Only auto-redirect on 401 for protected routes (not auth endpoints)
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthEndpoint) {
      // Token expired / invalid — clear and go to login
      localStorage.removeItem('sp_token')
      // Use replace so user can't "back" into a broken state
      window.location.replace('/smartpharma/login')
    }

    return Promise.reject(err)
  }
)

export default api
