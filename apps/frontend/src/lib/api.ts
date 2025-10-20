import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import config from '../config'

export interface ApiError {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId?: string
  errors?: Record<string, string[]>
}

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For refresh token cookie
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
      // Try to refresh token
      try {
        const { data } = await api.post('/auth/refresh')
        const { accessToken } = data
        
        useAuthStore.getState().setAccessToken(accessToken)
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    if (apiError?.detail) {
      return apiError.detail
    }
    if (apiError?.title) {
      return apiError.title
    }
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0]
      if (firstError && firstError.length > 0) {
        return firstError[0]
      }
    }
    if (error.response?.statusText) {
      return error.response.statusText
    }
    if (error.message) {
      return error.message
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export default api
