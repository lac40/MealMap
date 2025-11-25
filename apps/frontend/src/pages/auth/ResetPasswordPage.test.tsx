import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import ResetPasswordPage from './ResetPasswordPage'
import { accountService } from '@/services/accountService'

vi.mock('@/services/accountService', () => ({
  accountService: {
    resetPassword: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('ResetPasswordPage', () => {
  it('shows invalid link state when token missing', async () => {
    globalThis.history.pushState({}, 'Reset', '/reset-password')
    render(<ResetPasswordPage />)
    await waitFor(() => {
      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /request new link/i })).toBeInTheDocument()
    })
  })

  it('renders form when token present', () => {
    globalThis.history.pushState({}, 'Reset', '/reset-password?token=abc123')
    render(<ResetPasswordPage />)
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('validates password mismatch', async () => {
    globalThis.history.pushState({}, 'Reset', '/reset-password?token=abc123')
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Different123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
    })
  })

  it('submits and shows success state', async () => {
    globalThis.history.pushState({}, 'Reset', '/reset-password?token=abc123')
    render(<ResetPasswordPage />)
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

    await waitFor(() => {
      expect(accountService.resetPassword).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Password Reset Successfully')).toBeInTheDocument()
    })
  })
})
