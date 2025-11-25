import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import * as authService from '@/services/auth.service'

// Mock modules
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('@/services/auth.service')

describe('RegisterPage', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useNavigate as any).mockReturnValue(mockNavigate)
  })

  it('renders registration form', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText(/MealMap/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/display name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('displays validation error for weak password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'weak')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/password must/i)
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('displays validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Different123')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
    const toggleButtons = screen.getAllByLabelText(/show password/i)
    
    expect(passwordInput.type).toBe('password')
    
    await user.click(toggleButtons[0])
    expect(passwordInput.type).toBe('text')
    
    await user.click(toggleButtons[0])
    expect(passwordInput.type).toBe('password')
  })

  it('toggles confirm password visibility', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
    const toggleButtons = screen.getAllByLabelText(/show password/i)
    
    expect(confirmPasswordInput.type).toBe('password')
    
    await user.click(toggleButtons[1])
    expect(confirmPasswordInput.type).toBe('text')
  })

  it('submits form with valid data and shows success message', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01T00:00:00Z',
    }
    
    vi.mocked(authService.register).mockResolvedValueOnce(mockUser)
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled()
      const callArgs = vi.mocked(authService.register).mock.calls[0][0]
      expect(callArgs).toMatchObject({
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      })
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    })
  })

  it('navigates to login after successful registration', async () => {
    const user = userEvent.setup()
    
    vi.mocked(authService.register).mockResolvedValueOnce({
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01T00:00:00Z',
    })
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    })
    
    const goToSignInButton = screen.getByRole('button', { name: /go to sign in/i })
    await user.click(goToSignInButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('displays server error on registration failure', async () => {
    const user = userEvent.setup()
    
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          title: 'Registration failed',
          status: 400,
          detail: 'Email already exists',
        },
        statusText: 'Bad Request',
      },
      message: 'Request failed with status code 400',
    }
    
    vi.mocked(authService.register).mockRejectedValueOnce(mockError)
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already exists/i)
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    
    vi.mocked(authService.register).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByLabelText(/display name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
  })

  it('has link to login page', () => {
    render(<RegisterPage />)
    
    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('clears server error on new submission', async () => {
    const user = userEvent.setup()
    
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          title: 'Error',
          status: 400,
          detail: 'First error',
        },
      },
    }
    
    vi.mocked(authService.register)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test',
        createdAt: '2024-01-01',
      })
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/display name/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/first error/i)
    })
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
