import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

const mockToggleTheme = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { displayName: 'Test User', email: 'user@example.com' }, logout: vi.fn() })
}))

vi.mock('@/store/themeStore', () => ({
  useThemeStore: () => ({ resolvedTheme: 'light', toggleTheme: mockToggleTheme })
}))

describe('Header', () => {
  it('renders user display name', () => {
    renderHeader()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('theme toggle button exists', () => {
    renderHeader()
    const themeButton = screen.getByLabelText(/Switch to/)
    expect(themeButton).toBeInTheDocument()
  })
})

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header onMobileMenuToggle={() => {}} isMobile={false} />
    </MemoryRouter>
  )
}
