import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/lib/api'
import { getDashboardStats, type DashboardStats } from './dashboard.service'

vi.mock('@/lib/api')

describe('dashboard.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardStats', () => {
    it('fetches dashboard statistics', async () => {
      const mockStats: DashboardStats = {
        ingredientsCount: 42,
        recipesCount: 15,
        plannedMealsCount: 8,
        pantryItemsCount: 28,
        upcomingMealsCount: 5,
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockStats })

      const result = await getDashboardStats()

      expect(api.get).toHaveBeenCalledWith('/dashboard/stats')
      expect(result).toEqual(mockStats)
      expect(result.ingredientsCount).toBe(42)
      expect(result.recipesCount).toBe(15)
    })

    it('returns all stat counts', async () => {
      const mockStats: DashboardStats = {
        ingredientsCount: 10,
        recipesCount: 5,
        plannedMealsCount: 3,
        pantryItemsCount: 12,
        upcomingMealsCount: 2,
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockStats })

      const result = await getDashboardStats()

      expect(result).toHaveProperty('ingredientsCount')
      expect(result).toHaveProperty('recipesCount')
      expect(result).toHaveProperty('plannedMealsCount')
      expect(result).toHaveProperty('pantryItemsCount')
      expect(result).toHaveProperty('upcomingMealsCount')
    })

    it('handles zero counts', async () => {
      const mockStats: DashboardStats = {
        ingredientsCount: 0,
        recipesCount: 0,
        plannedMealsCount: 0,
        pantryItemsCount: 0,
        upcomingMealsCount: 0,
      }

      vi.mocked(api.get).mockResolvedValue({ data: mockStats })

      const result = await getDashboardStats()

      expect(result.ingredientsCount).toBe(0)
      expect(result.upcomingMealsCount).toBe(0)
    })
  })
})
