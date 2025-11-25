import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { displayName: 'Test User', email: 'user@example.com' }, logout: vi.fn() })
}))
vi.mock('@/store/themeStore', () => ({
  useThemeStore: () => ({ resolvedTheme: 'light', toggleTheme: vi.fn() })
}))

describe('Header', () => {
  it('renders user display name', () => {
    renderHeader()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('toggles theme when clicking button', () => {
    const { toggleTheme } = require('@/store/themeStore').useThemeStore()
    renderHeader()
    fireEvent.click(screen.getByLabelText('Switch to dark mode'))
    expect(toggleTheme).toHaveBeenCalled()
  })
})

function renderHeader() {
  return (
    <MemoryRouter>
      <Header onMobileMenuToggle={() => {}} isMobile={false} />
    </MemoryRouter>
  )
}
