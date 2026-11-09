import axios from 'axios'

// In production, VITE_API_URL points to the Render API. During local
// development, the empty base URL keeps Vite's /api proxy in place.
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120_000,
  withCredentials: true,
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
