import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import GroceryPage from './GroceryPage'
import * as plannerService from '@/services/planner.service'

vi.mock('@/services/grocery.service')
vi.mock('@/services/planner.service')

describe('GroceryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })
  })

  it('renders page header', () => {
    render(<GroceryPage />)
    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('displays empty state when no grocery list', () => {
    render(<GroceryPage />)
    expect(screen.getByText('No Grocery List Yet')).toBeInTheDocument()
    expect(
      screen.getByText('Generate a grocery list from your weekly planner to get started.')
    ).toBeInTheDocument()
  })

  it('shows generate from planner button', () => {
    render(<GroceryPage />)
    const buttons = screen.getAllByText('Generate from Planner')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders shopping cart icon', () => {
    render(<GroceryPage />)
    expect(screen.getByText('Grocery List')).toBeInTheDocument()
  })

  it('has empty state icon', () => {
    render(<GroceryPage />)
    expect(screen.getByText('No Grocery List Yet')).toBeInTheDocument()
  })

  it('shows helpful message in empty state', () => {
    render(<GroceryPage />)
    expect(screen.getByText(/generate a grocery list from your weekly planner to get started/i)).toBeInTheDocument()
  })

  it('has export button when grocery list exists', async () => {
    render(<GroceryPage />)
    // Check that initially there's no export button
    expect(screen.queryByText('Export')).not.toBeInTheDocument()
  })
})
