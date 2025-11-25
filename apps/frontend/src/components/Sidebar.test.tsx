import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

const renderSidebar = (props?: Partial<React.ComponentProps<typeof Sidebar>>) => {
  return (
    <MemoryRouter>
      <Sidebar
        isCollapsed={false}
        isMobileOpen={false}
        onToggleCollapse={() => {}}
        onToggleMobile={() => {}}
        isMobile={false}
        {...props}
      />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  it('renders navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Pantry')).toBeInTheDocument()
    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('collapses labels when isCollapsed=true', () => {
    renderSidebar({ isCollapsed: true })
    // Labels should be hidden, icons still present
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })
})
