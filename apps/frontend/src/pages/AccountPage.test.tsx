import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@/test/utils'
import AccountPage from './AccountPage'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

// Mock stores
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { displayName: 'Test User', email: 'user@example.com' } })
}))
vi.mock('@/store/themeStore', () => ({
  useThemeStore: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light', toggleTheme: vi.fn() })
}))

describe('AccountPage', () => {
  it('renders all section headers', () => {
    render(<AccountPage />)
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile Information')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })

  it('allows editing profile', () => {
    render(<AccountPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows theme buttons', () => {
    render(<AccountPage />)
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument()
  })
})
