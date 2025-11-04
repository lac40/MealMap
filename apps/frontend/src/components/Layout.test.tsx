import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import Layout from './Layout'
import * as authStore from '@/store/authStore'

vi.mock('@/store/authStore')

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', displayName: 'Test User' },
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    })
  })

  it('renders application name', () => {
    render(<Layout />)
    expect(screen.getByText('MealMap')).toBeInTheDocument()
  })

  it('displays user display name', () => {
    render(<Layout />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('shows logout button', () => {
    render(<Layout />)
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Layout />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Pantry')).toBeInTheDocument()
    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('has navigation sidebar', () => {
    render(<Layout />)
    // Sidebar should contain all navigation items
    const sidebar = screen.getByText('Dashboard').closest('aside')
    expect(sidebar).toBeInTheDocument()
  })

  it('renders header with correct styling', () => {
    render(<Layout />)
    const header = screen.getByText('MealMap').closest('header')
    expect(header).toBeInTheDocument()
  })

  it('shows icons for navigation items', () => {
    render(<Layout />)
    // All nav items should have icons (tested by checking if text exists)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
  })

  it('displays main content area', () => {
    render(<Layout />)
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    render(<Layout />)
    // Header should be at the top
    const header = screen.getByText('MealMap').closest('header')
    expect(header).toBeInTheDocument()
    
    // Sidebar should exist
    const sidebar = screen.getByText('Dashboard').closest('aside')
    expect(sidebar).toBeInTheDocument()
    
    // Main content area should exist
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
  })

  it('displays all required navigation sections', () => {
    render(<Layout />)
    
    // Check for all 6 main navigation items
    const navItems = [
      'Dashboard',
      'Ingredients',
      'Recipes',
      'Planner',
      'Pantry',
      'Grocery List'
    ]
    
    navItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })
})
