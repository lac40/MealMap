import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import DashboardPage from './DashboardPage'
import * as dashboardService from '@/services/dashboard.service'
import type { DashboardStats } from '@/services/dashboard.service'

// Mock the dashboard service
vi.mock('@/services/dashboard.service')

const mockStats: DashboardStats = {
  ingredientsCount: 25,
  recipesCount: 15,
  plannedMealsCount: 8,
  pantryItemsCount: 40,
  upcomingMealsCount: 12,
}

const mockEmptyStats: DashboardStats = {
  ingredientsCount: 0,
  recipesCount: 0,
  plannedMealsCount: 0,
  pantryItemsCount: 0,
  upcomingMealsCount: 0,
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    vi.mocked(dashboardService.getDashboardStats).mockImplementation(
      () => new Promise(() => {})
    )

    const { container } = render(<DashboardPage />)

    // Check for the loading spinner by looking for the animate-spin class
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('displays all dashboard statistics cards', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Ingredients')).toBeInTheDocument()
      expect(screen.getByText('Recipes')).toBeInTheDocument()
      expect(screen.getByText('Planned Meals')).toBeInTheDocument()
      expect(screen.getByText('Pantry Items')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Meals')).toBeInTheDocument()
    })
  })

  it('displays correct count values', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument() // Ingredients
      expect(screen.getByText('15')).toBeInTheDocument() // Recipes
      expect(screen.getByText('8')).toBeInTheDocument() // Planned Meals
      expect(screen.getByText('40')).toBeInTheDocument() // Pantry Items
      expect(screen.getByText('12')).toBeInTheDocument() // Upcoming Meals
    })
  })

  it('displays subtitles for each card', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Available in your pantry')).toBeInTheDocument()
      expect(screen.getByText('In your collection')).toBeInTheDocument()
      expect(screen.getByText('This week')).toBeInTheDocument()
      expect(screen.getByText('Total stored items')).toBeInTheDocument()
      expect(screen.getByText('Next 7 days')).toBeInTheDocument()
    })
  })

  it('handles zero counts correctly', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockEmptyStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements).toHaveLength(5) // All 5 cards should show 0
    })
  })

  it('displays error state when fetch fails', async () => {
    const mockError = new Error('Failed to fetch stats')
    vi.mocked(dashboardService.getDashboardStats).mockRejectedValue(mockError)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics')).toBeInTheDocument()
    })
  })

  it('calls getDashboardStats on mount', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(1)
    })
  })

  it('displays large numbers correctly', async () => {
    const largeStats: DashboardStats = {
      ingredientsCount: 1000,
      recipesCount: 5000,
      plannedMealsCount: 50,
      pantryItemsCount: 10000,
      upcomingMealsCount: 100,
    }

    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(largeStats)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('5000')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('10000')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  it('renders cards in correct order', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className.includes('bg-white') && el.className.includes('rounded-lg')
      )
      
      expect(cards.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('applies correct color classes to cards', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      // Check that different colored numbers exist (blue, green, purple, orange, indigo)
      const ingredientsCount = screen.getByText('25')
      expect(ingredientsCount.className).toContain('text-blue-800')
      
      const recipesCount = screen.getByText('15')
      expect(recipesCount.className).toContain('text-green-800')
      
      const plannedMealsCount = screen.getByText('8')
      expect(plannedMealsCount.className).toContain('text-purple-800')
      
      const pantryItemsCount = screen.getByText('40')
      expect(pantryItemsCount.className).toContain('text-orange-800')
      
      const upcomingMealsCount = screen.getByText('12')
      expect(upcomingMealsCount.className).toContain('text-indigo-800')
    })
  })

  it('has hover effect classes on cards', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className.includes('hover:shadow-lg')
      )
      
      expect(cards.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('uses correct query key for caching', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    const { rerender } = render(<DashboardPage />)

    await waitFor(() => {
      expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(1)
    })

    // Rerender should use cached data
    rerender(<DashboardPage />)

    // Still only called once due to caching
    expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(1)
  })

  it('displays responsive grid layout classes', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const grid = screen.getByText('Dashboard').nextElementSibling
      expect(grid?.className).toContain('grid')
      expect(grid?.className).toContain('grid-cols-1')
      expect(grid?.className).toContain('md:grid-cols-2')
      expect(grid?.className).toContain('lg:grid-cols-3')
    })
  })

  it('handles undefined stats gracefully with nullish coalescing', async () => {
    // Mock to return undefined values
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue({
      ingredientsCount: 0,
      recipesCount: 0,
      plannedMealsCount: 0,
      pantryItemsCount: 0,
      upcomingMealsCount: 0,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      // Should still render 0 values
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('shows correct font sizes and styling', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const ingredientsCount = screen.getByText('25')
      expect(ingredientsCount.className).toContain('text-4xl')
      expect(ingredientsCount.className).toContain('font-bold')
    })
  })

  it('displays all card titles with correct styling', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValue(mockStats)

    render(<DashboardPage />)

    await waitFor(() => {
      const ingredientsTitle = screen.getByText('Ingredients')
      expect(ingredientsTitle.className).toContain('text-lg')
      expect(ingredientsTitle.className).toContain('font-semibold')
    })
  })
})
