import api from '@/lib/api'
import { User } from '@/store/authStore'

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface LoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  user: User
}

export interface RefreshResponse {
  accessToken: string
  expiresIn: number
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', data)
  return response.data
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data)
  return response.data
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>('/auth/refresh')
  return response.data
}

/**
 * Logout and revoke refresh token
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(): Promise<void> {
  await api.post('/auth/verify/start')
}

/**
 * Confirm email verification
 */
export async function confirmEmailVerification(token: string): Promise<void> {
  await api.post('/auth/verify/confirm', { token })
}

/**
 * Begin MFA setup
 */
export async function setupMFA(): Promise<{ secret: string; otpauthUrl: string }> {
  const response = await api.post('/auth/mfa/setup')
  return response.data
}

/**
 * Confirm MFA enrollment
 */
export async function confirmMFA(code: string): Promise<void> {
  await api.post('/auth/mfa/confirm', { code })
}

/**
 * Disable MFA
 */
export async function disableMFA(): Promise<void> {
  await api.post('/auth/mfa/disable')
}
