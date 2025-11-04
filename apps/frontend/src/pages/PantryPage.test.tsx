import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import PantryPage from './PantryPage'
import * as pantryService from '@/services/pantry.service'

vi.mock('@/services/pantry.service')
vi.mock('@/services/ingredient.service')

describe('PantryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header', async () => {
    vi.mocked(pantryService.getPantryItems).mockResolvedValue({ data: [], nextCursor: null })

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Pantry')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    vi.mocked(pantryService.getPantryItems).mockImplementation(() => new Promise(() => {}))

    render(<PantryPage />)

    expect(screen.getByText('Loading pantry...')).toBeInTheDocument()
  })

  it('displays empty state when no pantry items', async () => {
    vi.mocked(pantryService.getPantryItems).mockResolvedValue({ data: [], nextCursor: null })

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Your pantry is empty')).toBeInTheDocument()
      expect(screen.getByText('Start adding ingredients to track your inventory')).toBeInTheDocument()
    })
  })

  it('shows add item button', async () => {
    vi.mocked(pantryService.getPantryItems).mockResolvedValue({ data: [], nextCursor: null })

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })
  })

  it('displays pantry items grouped by category', async () => {
    const mockPantryData: any = {
      data: [
        {
          id: 'pantry-1',
          ingredientId: 'ing-1',
          ingredientName: 'Chicken Breast',
          categoryId: 'cat-1',
          categoryName: 'Meat',
          quantity: { amount: 1000, unit: 'g' as const },
          userId: 'user-1',
          householdId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'pantry-2',
          ingredientId: 'ing-2',
          ingredientName: 'Rice',
          categoryId: 'cat-2',
          categoryName: 'Grains',
          quantity: { amount: 500, unit: 'g' as const },
          userId: 'user-1',
          householdId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    }

    vi.mocked(pantryService.getPantryItems).mockResolvedValue(mockPantryData)

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Meat')).toBeInTheDocument()
      expect(screen.getByText('Grains')).toBeInTheDocument()
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
      expect(screen.getByText('Rice')).toBeInTheDocument()
    })
  })

  it('displays item quantities', async () => {
    const mockPantryData: any = {
      data: [
        {
          id: 'pantry-1',
          ingredientId: 'ing-1',
          ingredientName: 'Chicken Breast',
          categoryId: 'cat-1',
          categoryName: 'Meat',
          quantity: { amount: 1000, unit: 'g' as const },
          userId: 'user-1',
          householdId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    }

    vi.mocked(pantryService.getPantryItems).mockResolvedValue(mockPantryData)

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('1000 g')).toBeInTheDocument()
    })
  })

  it('shows edit and delete buttons for each item', async () => {
    const mockPantryData: any = {
      data: [
        {
          id: 'pantry-1',
          ingredientId: 'ing-1',
          ingredientName: 'Chicken Breast',
          categoryId: 'cat-1',
          categoryName: 'Meat',
          quantity: { amount: 1000, unit: 'g' as const },
          userId: 'user-1',
          householdId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    }

    vi.mocked(pantryService.getPantryItems).mockResolvedValue(mockPantryData)

    render(<PantryPage />)

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText('Edit item')
      const deleteButtons = screen.getAllByLabelText('Delete item')
      expect(editButtons.length).toBeGreaterThan(0)
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  it('displays error state when fetch fails', async () => {
    vi.mocked(pantryService.getPantryItems).mockRejectedValue(new Error('Failed to fetch'))

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading pantry/i)).toBeInTheDocument()
    })
  })

  it('renders subtitle text', async () => {
    vi.mocked(pantryService.getPantryItems).mockResolvedValue({ data: [], nextCursor: null })

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Manage your ingredient inventory')).toBeInTheDocument()
    })
  })

  it('shows add first item button in empty state', async () => {
    vi.mocked(pantryService.getPantryItems).mockResolvedValue({ data: [], nextCursor: null })

    render(<PantryPage />)

    await waitFor(() => {
      expect(screen.getByText('Add Your First Item')).toBeInTheDocument()
    })
  })
})
