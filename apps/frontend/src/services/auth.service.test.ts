import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/lib/api'
import {
  register,
  login,
  refreshToken,
  logout,
  sendVerificationEmail,
  confirmEmailVerification,
  setupMFA,
  confirmMFA,
  disableMFA,
  type RegisterRequest,
  type LoginRequest,
  type LoginResponse,
} from './auth.service'
import type { User } from '@/store/authStore'

vi.mock('@/lib/api')

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Registration', () => {
    it('should successfully register a new user and return user data without email verification', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        displayName: 'Test User',
      }

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        mfaEnabled: false,
        createdAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockUser })

      const result = await register(registerData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockUser)
      expect(result.emailVerified).toBe(false)
    })
  })

  describe('User Login', () => {
    it('should successfully authenticate user with valid email and password credentials', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const mockResponse: LoginResponse = {
        accessToken: 'token-abc-123',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true,
          mfaEnabled: false,
          createdAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await login(loginData)

      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData)
      expect(result).toEqual(mockResponse)
      expect(result.accessToken).toBe('token-abc-123')
      expect(result.expiresIn).toBe(3600)
    })

    it('should successfully authenticate user with valid credentials and MFA verification code', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        mfaCode: '123456',
      }

      const mockResponse: LoginResponse = {
        accessToken: 'token-xyz-456',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true,
          mfaEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await login(loginData)

      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData)
      expect(result.user.mfaEnabled).toBe(true)
    })
  })

  describe('Token Refresh', () => {
    it('should successfully refresh expired access token and return new token with expiration time', async () => {
      const mockResponse = {
        accessToken: 'new-token-123',
        expiresIn: 3600,
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await refreshToken()

      expect(api.post).toHaveBeenCalledWith('/auth/refresh')
      expect(result.accessToken).toBe('new-token-123')
      expect(result.expiresIn).toBe(3600)
    })
  })

  describe('User Logout', () => {
    it('should successfully log out user and revoke refresh token on server', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('Email Verification Request', () => {
    it('should successfully send verification email to user email address', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await sendVerificationEmail()

      expect(api.post).toHaveBeenCalledWith('/auth/verify/start')
    })
  })

  describe('Email Verification Confirmation', () => {
    it('should successfully verify user email address using provided verification token', async () => {
      const token = 'verification-token-123'

      vi.mocked(api.post).mockResolvedValue({})

      await confirmEmailVerification(token)

      expect(api.post).toHaveBeenCalledWith('/auth/verify/confirm', { token })
    })
  })

  describe('Multi-Factor Authentication Setup', () => {
    it('should successfully initiate MFA setup and return secret key with QR code URL for authenticator app', async () => {
      const mockResponse = {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/MealMap:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MealMap',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await setupMFA()

      expect(api.post).toHaveBeenCalledWith('/auth/mfa/setup')
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP')
      expect(result.otpauthUrl).toContain('otpauth://totp/')
    })
  })

  describe('Multi-Factor Authentication Confirmation', () => {
    it('should successfully enable MFA after user provides valid verification code from authenticator app', async () => {
      const code = '123456'

      vi.mocked(api.post).mockResolvedValue({})

      await confirmMFA(code)

      expect(api.post).toHaveBeenCalledWith('/auth/mfa/confirm', { code })
    })
  })

  describe('Multi-Factor Authentication Disable', () => {
    it('should successfully disable MFA protection for authenticated user account', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await disableMFA()

      expect(api.post).toHaveBeenCalledWith('/auth/mfa/disable')
    })
  })
})
