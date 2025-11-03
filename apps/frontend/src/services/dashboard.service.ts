import api from '../lib/api'

export interface DashboardStats {
  ingredientsCount: number
  recipesCount: number
  plannedMealsCount: number
  pantryItemsCount: number
  upcomingMealsCount: number
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats')
  return response.data
}
