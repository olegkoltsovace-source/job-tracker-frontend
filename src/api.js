import axios from 'axios'
import router from './router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If token expired or invalid — clear storage and redirect to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api