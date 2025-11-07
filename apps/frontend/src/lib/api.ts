/**
 * API Client Configuration
 * 
 * Centralized Axios instance for all API requests with:
 * - Automatic authentication token injection
 * - Automatic token refresh on 401 errors
 * - Error handling and transformation
 * - Cookie-based refresh token support
 * 
 * All services use this configured instance to communicate with the backend.
 */

import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import config from '../config'

/**
 * Standard API error response structure
 * Follows RFC 7807 Problem Details format
 */
export interface ApiError {
  type?: string                          // URI reference identifying the problem type
  title: string                          // Short, human-readable summary
  status: number                         // HTTP status code
  detail?: string                        // Human-readable explanation
  instance?: string                      // URI reference to specific occurrence
  traceId?: string                       // Correlation ID for debugging
  errors?: Record<string, string[]>      // Validation errors by field
}

/**
 * Axios instance pre-configured for API communication
 * 
 * Base configuration:
 * - baseURL: API endpoint from environment config
 * - withCredentials: true - Enables sending/receiving cookies for refresh tokens
 * - Content-Type: application/json
 */
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For refresh token cookie
})

/**
 * Request Interceptor
 * 
 * Automatically adds the JWT access token to all outgoing requests
 * Reads the token from the auth store and adds it to the Authorization header
 */
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

/**
 * Response Interceptor
 * 
 * Handles authentication errors and automatic token refresh:
 * 
 * 1. If a request fails with 401 Unauthorized
 * 2. Attempts to refresh the access token using the refresh token cookie
 * 3. On success: Updates the store and retries the original request
 * 4. On failure: Logs the user out and redirects to login
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config
    
    // Only attempt token refresh for 401 errors, and avoid infinite loops
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
      // Try to refresh token
      try {
        const { data } = await api.post('/auth/refresh')
        const { accessToken } = data
        
        // Update the access token in the auth store
        useAuthStore.getState().setAccessToken(accessToken)
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout and redirect to login
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
 * 
 * Provides a user-friendly error message by checking multiple possible locations
 * in the error response hierarchy
 * 
 * @param error - Error object from failed API request
 * @returns Human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    
    // Try to extract error message from various locations
    if (apiError?.detail) {
      return apiError.detail
    }
    if (apiError?.title) {
      return apiError.title
    }
    // For validation errors, return the first error message
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
