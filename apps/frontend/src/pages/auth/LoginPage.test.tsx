import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
import LoginPage from './LoginPage'
import * as authService from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

// Mock modules
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('@/services/auth.service')

describe('LoginPage', () => {
  const mockNavigate = vi.fn()
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useNavigate as any).mockReturnValue(mockNavigate)
    useAuthStore.setState({ login: mockLogin, isAuthenticated: false, user: null, accessToken: null })
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText(/MealMap/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
    const toggleButton = screen.getByLabelText(/show password/i)
    
    expect(passwordInput.type).toBe('password')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid data and navigates on success', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01T00:00:00Z',
    }
    
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'token123',
      expiresIn: 900,
      user: mockUser,
    })
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled()
      const callArgs = vi.mocked(authService.login).mock.calls[0][0]
      expect(callArgs).toMatchObject({
        email: 'test@example.com',
        password: 'Password123',
      })
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'token123')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays server error on login failure', async () => {
    const user = userEvent.setup()
    
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          title: 'Invalid credentials',
          status: 401,
          detail: 'Email or password is incorrect',
        },
      },
    }
    
    vi.mocked(authService.login).mockRejectedValueOnce(mockError)
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email or password is incorrect/i)
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    
    vi.mocked(authService.login).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled()
  })

  it('has link to registration page', () => {
    render(<LoginPage />)
    
    const registerLink = screen.getByRole('link', { name: /sign up/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('has forgot password link', () => {
    render(<LoginPage />)
    
    const forgotLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('clears server error on new submission', async () => {
    const user = userEvent.setup()
    
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          title: 'Error',
          status: 401,
          detail: 'First error',
        },
      },
    }
    
    vi.mocked(authService.login)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        accessToken: 'token',
        expiresIn: 900,
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test',
          createdAt: '2024-01-01',
        },
      })
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/first error/i)
    })
    
    await user.clear(screen.getByLabelText(/^password$/i))
    await user.type(screen.getByLabelText(/^password$/i), 'correctpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
