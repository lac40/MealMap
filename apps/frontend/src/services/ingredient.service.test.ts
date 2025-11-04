import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/lib/api'
import {
  getIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getCategories,
  type CreateIngredientDto,
  type UpdateIngredientDto,
} from './ingredient.service'
import type { Ingredient, Category } from '@/types/api'

vi.mock('@/lib/api')

describe('ingredient.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getIngredients', () => {
    it('fetches paginated ingredients without params', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            ownerUserId: 'user-1',
            name: 'Tomato',
            categoryId: 'cat-1',
            defaultUnit: 'kg' as const,
            packageSize: { amount: 1, unit: 'kg' as const },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        nextCursor: null,
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getIngredients()

      expect(api.get).toHaveBeenCalledWith('/ingredients', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('fetches ingredients with search query', async () => {
      const mockResponse = { data: [], nextCursor: null }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      await getIngredients({ q: 'tomato', limit: 10 })

      expect(api.get).toHaveBeenCalledWith('/ingredients', {
        params: { q: 'tomato', limit: 10 },
      })
    })

    it('fetches ingredients with category filter', async () => {
      const mockResponse = { data: [], nextCursor: null }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      await getIngredients({ categoryId: 'cat-1' })

      expect(api.get).toHaveBeenCalledWith('/ingredients', {
        params: { categoryId: 'cat-1' },
      })
    })

    it('fetches ingredients with cursor for pagination', async () => {
      const mockResponse = { data: [], nextCursor: 'cursor-123' }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getIngredients({ cursor: 'cursor-abc' })

      expect(api.get).toHaveBeenCalledWith('/ingredients', {
        params: { cursor: 'cursor-abc' },
      })
      expect(result.nextCursor).toBe('cursor-123')
    })
  })

  describe('getIngredient', () => {
    it('fetches a single ingredient by ID', async () => {
      const mockIngredient: Ingredient = {
        id: '1',
        ownerUserId: 'user-1',
        name: 'Tomato',
        categoryId: 'cat-1',
        defaultUnit: 'kg',
        packageSize: { amount: 1, unit: 'kg' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockIngredient })

      const result = await getIngredient('1')

      expect(api.get).toHaveBeenCalledWith('/ingredients/1')
      expect(result).toEqual(mockIngredient)
    })
  })

  describe('createIngredient', () => {
    it('creates a new ingredient', async () => {
      const newIngredient: CreateIngredientDto = {
        name: 'Carrot',
        categoryId: 'cat-1',
        defaultUnit: 'kg',
        packageSize: { amount: 0.5, unit: 'kg' },
        notes: 'Organic',
      }

      const mockResponse: Ingredient = {
        id: '2',
        ownerUserId: 'user-1',
        ...newIngredient,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createIngredient(newIngredient)

      expect(api.post).toHaveBeenCalledWith('/ingredients', newIngredient)
      expect(result).toEqual(mockResponse)
    })

    it('creates ingredient without optional notes', async () => {
      const newIngredient: CreateIngredientDto = {
        name: 'Potato',
        categoryId: 'cat-1',
        defaultUnit: 'kg',
        packageSize: { amount: 2, unit: 'kg' },
      }

      const mockResponse: Ingredient = {
        id: '3',
        ownerUserId: 'user-1',
        ...newIngredient,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createIngredient(newIngredient)

      expect(result.notes).toBeUndefined()
    })
  })

  describe('updateIngredient', () => {
    it('updates an existing ingredient', async () => {
      const updateData: UpdateIngredientDto = {
        id: '1',
        name: 'Updated Tomato',
        notes: 'Updated notes',
      }

      const mockResponse: Ingredient = {
        id: '1',
        ownerUserId: 'user-1',
        name: 'Updated Tomato',
        categoryId: 'cat-1',
        defaultUnit: 'kg',
        packageSize: { amount: 1, unit: 'kg' },
        notes: 'Updated notes',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse })

      const result = await updateIngredient(updateData)

      expect(api.patch).toHaveBeenCalledWith('/ingredients/1', {
        name: 'Updated Tomato',
        notes: 'Updated notes',
      })
      expect(result).toEqual(mockResponse)
    })

    it('updates only specified fields', async () => {
      const updateData: UpdateIngredientDto = {
        id: '1',
        defaultUnit: 'g',
      }

      const mockResponse: Ingredient = {
        id: '1',
        ownerUserId: 'user-1',
        name: 'Tomato',
        categoryId: 'cat-1',
        defaultUnit: 'g',
        packageSize: { amount: 1, unit: 'kg' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse })

      await updateIngredient(updateData)

      expect(api.patch).toHaveBeenCalledWith('/ingredients/1', {
        defaultUnit: 'g',
      })
    })
  })

  describe('deleteIngredient', () => {
    it('deletes an ingredient by ID', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteIngredient('1')

      expect(api.delete).toHaveBeenCalledWith('/ingredients/1')
    })
  })

  describe('getCategories', () => {
    it('fetches all categories', async () => {
      const mockCategories: Category[] = [
        { id: 'cat-1', name: 'Vegetables' },
        { id: 'cat-2', name: 'Fruits' },
        { id: 'cat-3', name: 'Dairy' },
      ]

      vi.mocked(api.get).mockResolvedValue({ data: mockCategories })

      const result = await getCategories()

      expect(api.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual(mockCategories)
      expect(result).toHaveLength(3)
    })
  })
})
