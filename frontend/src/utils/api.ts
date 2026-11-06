import axios from 'axios'

export const api = axios.create({
  baseURL: '',            // proxied through Vite to localhost:8000
  timeout: 120_000,       // 2 min timeout for analysis
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 413) {
      return Promise.reject(new Error('File too large (max 50 MB)'))
    }
    return Promise.reject(err)
  }
)
