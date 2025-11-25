import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import ForgotPasswordPage from './ForgotPasswordPage'
import { accountService } from '@/services/accountService'

vi.mock('@/services/accountService', () => ({
  accountService: {
    forgotPassword: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('ForgotPasswordPage', () => {
  it('renders form elements', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    render(<ForgotPasswordPage />)
    const input = screen.getByLabelText('Email Address') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('submits and shows success state (email enumeration protected)', async () => {
    render(<ForgotPasswordPage />)
    const input = screen.getByLabelText('Email Address') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    await waitFor(() => {
      expect(accountService.forgotPassword).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
    })
  })
})
