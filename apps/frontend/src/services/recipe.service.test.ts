import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/lib/api'
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type CreateRecipeDto,
  type UpdateRecipeDto,
} from './recipe.service'
import type { Recipe } from '@/types/api'

vi.mock('@/lib/api')

describe('recipe.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecipes', () => {
    it('fetches paginated recipes without params', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'Pasta Carbonara',
            externalUrl: null,
            notes: 'Note',
            items: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        nextCursor: null,
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getRecipes()

      expect(api.get).toHaveBeenCalledWith('/recipes', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('fetches recipes with search query', async () => {
      const mockResponse = { data: [], nextCursor: null }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      await getRecipes({ search: 'pasta', limit: 10 })

      expect(api.get).toHaveBeenCalledWith('/recipes', {
        params: { limit: 10, cursor: undefined, q: 'pasta' },
      })
    })

    it('fetches recipes with cursor for pagination', async () => {
      const mockResponse = { data: [], nextCursor: 'cursor-123' }
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

      const result = await getRecipes({ cursor: 'cursor-abc' })

      expect(api.get).toHaveBeenCalledWith('/recipes', {
        params: { limit: undefined, cursor: 'cursor-abc', q: undefined },
      })
      expect(result.nextCursor).toBe('cursor-123')
    })
  })

  describe('getRecipe', () => {
    it('fetches a single recipe by ID', async () => {
      const mockRecipe: Recipe = {
        id: '1',
        name: 'Pasta Carbonara',
        externalUrl: 'https://example.com/recipe',
        notes: 'Note',
        items: [
          {
            ingredientId: 'ing-1',
            quantity: { amount: 200, unit: 'g' },
            packageNote: 'Fresh pasta',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockRecipe })

      const result = await getRecipe('1')

      expect(api.get).toHaveBeenCalledWith('/recipes/1')
      expect(result).toEqual(mockRecipe)
    })
  })

  describe('createRecipe', () => {
    it('creates a new recipe', async () => {
      const newRecipe: CreateRecipeDto = {
        name: 'Spaghetti Bolognese',
        externalUrl: null,
        notes: 'Family favorite',
        items: [
          {
            ingredientId: 'ing-1',
            quantity: { amount: 400, unit: 'g' },
          },
          {
            ingredientId: 'ing-2',
            quantity: { amount: 300, unit: 'g' },
            packageNote: 'Ground beef',
          },
        ],
      }

      const mockResponse: Recipe = {
        id: '2',
        ...newRecipe,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createRecipe(newRecipe)

      expect(api.post).toHaveBeenCalledWith('/recipes', newRecipe)
      expect(result).toEqual(mockResponse)
      expect(result.items).toHaveLength(2)
    })

    it('creates recipe with external URL', async () => {
      const newRecipe: CreateRecipeDto = {
        name: 'Pizza Margherita',
        externalUrl: 'https://example.com/pizza',
        notes: undefined,
        items: [],
      }

      const mockResponse: Recipe = {
        id: '3',
        ...newRecipe,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createRecipe(newRecipe)

      expect(result.externalUrl).toBe('https://example.com/pizza')
    })
  })

  describe('updateRecipe', () => {
    it('updates an existing recipe', async () => {
      const updateData: UpdateRecipeDto = {
        id: '1',
        name: 'Updated Pasta Carbonara',
        externalUrl: 'https://new-url.com',
        notes: 'Updated note',
        items: [
          {
            ingredientId: 'ing-1',
            quantity: { amount: 250, unit: 'g' },
          },
        ],
      }

      const mockResponse: Recipe = {
        id: '1',
        name: 'Updated Pasta Carbonara',
        externalUrl: 'https://new-url.com',
        notes: 'Updated note',
        items: updateData.items,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse })

      const result = await updateRecipe(updateData)

      expect(api.patch).toHaveBeenCalledWith('/recipes/1', {
        name: 'Updated Pasta Carbonara',
        externalUrl: 'https://new-url.com',
        notes: 'Updated note',
        items: updateData.items,
      })
      expect(result).toEqual(mockResponse)
    })

    it('removes external URL when updated to null', async () => {
      const updateData: UpdateRecipeDto = {
        id: '1',
        name: 'Pasta Carbonara',
        externalUrl: null,
        notes: null,
        items: [],
      }

      const mockResponse: Recipe = {
        ...updateData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      }

      vi.mocked(api.patch).mockResolvedValue({ data: mockResponse })

      const result = await updateRecipe(updateData)

      expect(result.externalUrl).toBeNull()
    })
  })

  describe('deleteRecipe', () => {
    it('deletes a recipe by ID', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteRecipe('1')

      expect(api.delete).toHaveBeenCalledWith('/recipes/1')
    })
  })
})
