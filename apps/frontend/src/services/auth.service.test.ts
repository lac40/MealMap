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

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('registers a new user', async () => {
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

  describe('login', () => {
    it('logs in with email and password', async () => {
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

    it('logs in with MFA code', async () => {
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

  describe('refreshToken', () => {
    it('refreshes the access token', async () => {
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

  describe('logout', () => {
    it('logs out and revokes refresh token', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('sendVerificationEmail', () => {
    it('sends a verification email', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await sendVerificationEmail()

      expect(api.post).toHaveBeenCalledWith('/auth/verify/start')
    })
  })

  describe('confirmEmailVerification', () => {
    it('confirms email verification with token', async () => {
      const token = 'verification-token-123'

      vi.mocked(api.post).mockResolvedValue({})

      await confirmEmailVerification(token)

      expect(api.post).toHaveBeenCalledWith('/auth/verify/confirm', { token })
    })
  })

  describe('setupMFA', () => {
    it('begins MFA setup and returns secret and URL', async () => {
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

  describe('confirmMFA', () => {
    it('confirms MFA enrollment with code', async () => {
      const code = '123456'

      vi.mocked(api.post).mockResolvedValue({})

      await confirmMFA(code)

      expect(api.post).toHaveBeenCalledWith('/auth/mfa/confirm', { code })
    })
  })

  describe('disableMFA', () => {
    it('disables MFA for the user', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await disableMFA()

      expect(api.post).toHaveBeenCalledWith('/auth/mfa/disable')
    })
  })
})
