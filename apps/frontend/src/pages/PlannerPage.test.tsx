import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import PlannerPage from './PlannerPage'
import * as plannerService from '@/services/planner.service'

// Mock the planner service with utility functions
vi.mock('@/services/planner.service', () => {
  const mondayDate = new Date('2024-01-01') // A Monday
  return {
    getPlannerWeeks: vi.fn(),
    createPlannerWeek: vi.fn(),
    updatePlannerWeek: vi.fn(),
    formatDate: vi.fn((date: Date) => date.toISOString().split('T')[0]),
    getMondayOfWeek: vi.fn(() => mondayDate),
    getWeekDates: vi.fn(() => {
      // Generate 7 dates starting from Monday Jan 1, 2024
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(mondayDate)
        date.setDate(mondayDate.getDate() + i)
        return date
      })
    }),
  }
})
vi.mock('@/services/recipe.service')

describe('PlannerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Weekly Planner')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    vi.mocked(plannerService.getPlannerWeeks).mockImplementation(() => new Promise(() => {}))

    render(<PlannerPage />)

    expect(screen.getByText('Loading planner...')).toBeInTheDocument()
  })

  it('shows week navigation buttons', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  it('displays all day headers', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument()
      expect(screen.getByText('Tuesday')).toBeInTheDocument()
      expect(screen.getByText('Wednesday')).toBeInTheDocument()
      expect(screen.getByText('Thursday')).toBeInTheDocument()
      expect(screen.getByText('Friday')).toBeInTheDocument()
      expect(screen.getByText('Saturday')).toBeInTheDocument()
      expect(screen.getByText('Sunday')).toBeInTheDocument()
    })
  })

  it('displays all meal slot headers', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Breakfast')).toBeInTheDocument()
      expect(screen.getByText('Snack AM')).toBeInTheDocument()
      expect(screen.getByText('Lunch')).toBeInTheDocument()
      expect(screen.getByText('Snack PM')).toBeInTheDocument()
      expect(screen.getByText('Dinner')).toBeInTheDocument()
    })
  })

  it('shows add buttons in each cell', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      // 7 days * 5 meal slots = 35 add buttons
      expect(addButtons.length).toBe(35)
    })
  })

  it('displays current week date range', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      const weekText = screen.getByText(/Week of/i)
      expect(weekText).toBeInTheDocument()
    })
  })

  it('renders planner grid layout', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Meal')).toBeInTheDocument()
    })
  })

  it('displays subtitle with date range', async () => {
    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue({ data: [], nextCursor: null })

    render(<PlannerPage />)

    await waitFor(() => {
      // The date range is dynamically generated
      const subtitle = screen.getByText(/Week of/i)
      expect(subtitle).toBeInTheDocument()
    })
  })

  it('renders planner items when week has meals', async () => {
    const mockWeekData: any = {
      data: [
        {
          id: 'week-1',
          userId: 'user-1',
          householdId: null,
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          items: [
            {
              id: 'item-1',
              planWeekId: 'week-1',
              date: '2024-01-01',
              slot: 'breakfast' as const,
              recipeId: 'recipe-1',
              recipeName: 'Scrambled Eggs',
              portions: 2,
              addedByUserId: 'user-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    }

    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue(mockWeekData)

    render(<PlannerPage />)

    await waitFor(() => {
      expect(screen.getByText('Scrambled Eggs')).toBeInTheDocument()
      expect(screen.getByText('2 portions')).toBeInTheDocument()
    })
  })

  it('shows remove meal buttons for planned items', async () => {
    const mockWeekData: any = {
      data: [
        {
          id: 'week-1',
          userId: 'user-1',
          householdId: null,
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          items: [
            {
              id: 'item-1',
              planWeekId: 'week-1',
              date: '2024-01-01',
              slot: 'breakfast' as const,
              recipeId: 'recipe-1',
              recipeName: 'Scrambled Eggs',
              portions: 2,
              addedByUserId: 'user-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    }

    vi.mocked(plannerService.getPlannerWeeks).mockResolvedValue(mockWeekData)

    render(<PlannerPage />)

    await waitFor(() => {
      const removeButtons = screen.getAllByLabelText('Remove meal')
      expect(removeButtons.length).toBeGreaterThan(0)
    })
  })
})
