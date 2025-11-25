import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from './Layout'

// Mock child components to simplify testing
vi.mock('./Sidebar', () => ({
  default: () => (
    <aside data-testid="sidebar">
      <div>Dashboard</div>
      <div>Ingredients</div>
      <div>Recipes</div>
      <div>Planner</div>
      <div>Pantry</div>
      <div>Grocery List</div>
    </aside>
  )
}))

vi.mock('./Header', () => ({
  default: () => <header data-testid="header">MealMap</header>
}))

describe('Layout', () => {
  it('renders the layout structure', () => {
    render(<Layout />)
    
    // Should render sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    
    // Should render header
    expect(screen.getByTestId('header')).toBeInTheDocument()
    
    // Should render main content area
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
  })

  it('renders all layout sections', () => {
    const { container } = render(<Layout />)
    
    // Check for the main container
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    
    // Check for main content area
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('has proper flex layout', () => {
    const { container } = render(<Layout />)
    
    const mainContainer = container.querySelector('.min-h-screen')
    expect(mainContainer?.className).toContain('flex')
  })

  it('renders navigation items from mocked Sidebar', () => {
    render(<Layout />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Pantry')).toBeInTheDocument()
    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('renders header content from mocked Header', () => {
    render(<Layout />)
    
    expect(screen.getByText('MealMap')).toBeInTheDocument()
  })
})
