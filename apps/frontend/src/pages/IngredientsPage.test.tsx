import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import IngredientsPage from './IngredientsPage'
import * as ingredientService from '@/services/ingredient.service'
import type { Ingredient, Category } from '@/types/api'

// Mock the ingredient service
vi.mock('@/services/ingredient.service')

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Vegetables', sortOrder: 1 },
  { id: 'cat-2', name: 'Fruits', sortOrder: 2 },
  { id: 'cat-3', name: 'Dairy', sortOrder: 3 },
]

const mockIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    ownerUserId: 'user-1',
    name: 'Tomato',
    categoryId: 'cat-1',
    defaultUnit: 'g',
    packageSize: { amount: 500, unit: 'g' },
    notes: 'Fresh tomatoes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ing-2',
    ownerUserId: 'user-1',
    name: 'Milk',
    categoryId: 'cat-3',
    defaultUnit: 'l',
    packageSize: { amount: 1, unit: 'l' },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

describe('IngredientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ingredientService.getCategories).mockResolvedValue(mockCategories)
  })

  it('renders page header and empty state', async () => {
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })

    render(<IngredientsPage />)

    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('Manage your ingredient library')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('No ingredients yet')).toBeInTheDocument()
    })
  })

  it('displays loading state', () => {
    vi.mocked(ingredientService.getIngredients).mockImplementation(
      () => new Promise(() => {})
    )

    render(<IngredientsPage />)

    expect(screen.getByText('Loading ingredients...')).toBeInTheDocument()
  })

  it('displays list of ingredients', async () => {
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Milk')).toBeInTheDocument()
    })

    // Check ingredient details
    expect(screen.getByText('Vegetables')).toBeInTheDocument()
    expect(screen.getByText('Dairy')).toBeInTheDocument()
    expect(screen.getByText(/500 g/)).toBeInTheDocument()
    expect(screen.getByText(/1 l/)).toBeInTheDocument()
    expect(screen.getByText('Fresh tomatoes')).toBeInTheDocument()
  })

  it('filters ingredients by search query', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search ingredients...')
    await user.type(searchInput, 'tomato')

    await waitFor(() => {
      expect(ingredientService.getIngredients).toHaveBeenCalledWith({
        q: 'tomato',
        categoryId: undefined,
      })
    })
  })

  it('filters ingredients by category', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    const categoryFilter = screen.getByDisplayValue('All Categories')
    await user.selectOptions(categoryFilter, 'cat-1')

    await waitFor(() => {
      expect(ingredientService.getIngredients).toHaveBeenCalledWith({
        q: undefined,
        categoryId: 'cat-1',
      })
    })
  })

  it('opens form modal when Add Ingredient button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })

    render(<IngredientsPage />)

    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      expect(screen.getByLabelText(/ingredient name/i)).toBeInTheDocument()
    })
  })

  it('creates a new ingredient successfully', async () => {
    const user = userEvent.setup()
    const newIngredient: Ingredient = {
      id: 'ing-3',
      ownerUserId: 'user-1',
      name: 'Carrot',
      categoryId: 'cat-1',
      defaultUnit: 'g',
      packageSize: { amount: 1, unit: 'kg' },
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    }

    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })
    vi.mocked(ingredientService.createIngredient).mockResolvedValue(newIngredient)

    render(<IngredientsPage />)

    // Open form
    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    // Fill form
    await user.type(screen.getByLabelText(/ingredient name/i), 'Carrot')
    await user.selectOptions(screen.getByLabelText(/^category/i), 'cat-1')
    await user.selectOptions(screen.getByLabelText(/default unit/i), 'g')
    await user.type(screen.getByLabelText(/package amount/i), '1')
    await user.selectOptions(screen.getByLabelText(/package unit/i), 'kg')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create ingredient/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(ingredientService.createIngredient).toHaveBeenCalledWith({
        name: 'Carrot',
        categoryId: 'cat-1',
        defaultUnit: 'g',
        packageSize: { amount: 1, unit: 'kg' },
        notes: undefined,
      })
    })
  })

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })

    render(<IngredientsPage />)

    // Open form
    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /create ingredient/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ingredient name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/category is required/i)).toBeInTheDocument()
    })
  })

  it('opens edit form with pre-filled data', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    // Click edit button
    const editButtons = screen.getAllByLabelText(/edit ingredient/i)
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit Ingredient')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Tomato')).toBeInTheDocument()
      expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    })
  })

  it('updates an ingredient successfully', async () => {
    const user = userEvent.setup()
    const updatedIngredient: Ingredient = {
      ...mockIngredients[0],
      name: 'Cherry Tomato',
    }

    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })
    vi.mocked(ingredientService.updateIngredient).mockResolvedValue(updatedIngredient)

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    // Click edit button
    const editButtons = screen.getAllByLabelText(/edit ingredient/i)
    await user.click(editButtons[0])

    // Update name
    const nameInput = screen.getByDisplayValue('Tomato')
    await user.clear(nameInput)
    await user.type(nameInput, 'Cherry Tomato')

    // Submit
    const submitButton = screen.getByRole('button', { name: /update ingredient/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(ingredientService.updateIngredient).toHaveBeenCalled()
      const callArgs = vi.mocked(ingredientService.updateIngredient).mock.calls[0][0]
      expect(callArgs.id).toBe('ing-1')
      expect(callArgs.name).toBe('Cherry Tomato')
    })
  })

  it('deletes an ingredient after confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })
    vi.mocked(ingredientService.deleteIngredient).mockResolvedValue()

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete ingredient/i)
    await user.click(deleteButtons[0])

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete this ingredient?'
    )

    await waitFor(() => {
      expect(ingredientService.deleteIngredient).toHaveBeenCalledWith('ing-1')
    })

    confirmSpy.mockRestore()
  })

  it('does not delete ingredient if confirmation is cancelled', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: mockIngredients,
      nextCursor: null,
    })

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete ingredient/i)
    await user.click(deleteButtons[0])

    expect(confirmSpy).toHaveBeenCalled()
    expect(ingredientService.deleteIngredient).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('displays server error when create fails', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })
    
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          detail: 'Ingredient already exists',
        },
      },
    }
    vi.mocked(ingredientService.createIngredient).mockRejectedValue(mockError)

    render(<IngredientsPage />)

    // Open form and fill it
    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    await user.type(screen.getByLabelText(/ingredient name/i), 'Tomato')
    await user.selectOptions(screen.getByLabelText(/^category/i), 'cat-1')
    await user.selectOptions(screen.getByLabelText(/default unit/i), 'g')
    await user.type(screen.getByLabelText(/package amount/i), '500')
    await user.selectOptions(screen.getByLabelText(/package unit/i), 'g')

    // Submit
    const submitButton = screen.getByRole('button', { name: /create ingredient/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Ingredient already exists')).toBeInTheDocument()
    })
  })

  it('closes form modal when cancel button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })

    render(<IngredientsPage />)

    // Open form
    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    expect(screen.getByText('Add Ingredient')).toBeInTheDocument()

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Add Ingredient')).not.toBeInTheDocument()
    })
  })

  it('closes form modal when X button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(ingredientService.getIngredients).mockResolvedValue({
      data: [],
      nextCursor: null,
    })

    render(<IngredientsPage />)

    // Open form
    const addButton = screen.getAllByRole('button', { name: /add ingredient/i })[0]
    await user.click(addButton)

    // Click close button
    const closeButton = screen.getByLabelText(/close/i)
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Add Ingredient')).not.toBeInTheDocument()
    })
  })

  it('displays error when ingredients fetch fails', async () => {
    const mockError: any = {
      isAxiosError: true,
      response: {
        data: {
          detail: 'Failed to fetch ingredients',
        },
      },
    }
    vi.mocked(ingredientService.getIngredients).mockRejectedValue(mockError)

    render(<IngredientsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading ingredients/i)).toBeInTheDocument()
      expect(screen.getByText(/Failed to fetch ingredients/i)).toBeInTheDocument()
    })
  })
})
