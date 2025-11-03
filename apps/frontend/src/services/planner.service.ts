import api from '@/lib/api'

export type MealSlot = 'breakfast' | 'snackAM' | 'lunch' | 'snackPM' | 'dinner'

export interface PlannerItem {
  id: string
  date: string
  slot: MealSlot
  recipeId: string | null
  recipeName: string | null
  portions: number
  addedByUserId: string
}

export interface PlannerWeek {
  id: string
  startDate: string
  userId: string | null
  householdId: string | null
  items: PlannerItem[]
  createdAt: string
  updatedAt: string
}

export interface CreatePlannerItemRequest {
  date: string
  slot: MealSlot
  recipeId?: string
  portions: number
}

export interface CreatePlannerWeekRequest {
  startDate: string
  householdId?: string
  items?: CreatePlannerItemRequest[]
}

export interface UpdatePlannerWeekRequest {
  items: CreatePlannerItemRequest[]
}

export interface PlannerWeekPageResponse {
  data: PlannerWeek[]
  nextCursor: string | null
}

export interface GetPlannerWeeksParams {
  from?: string
  to?: string
  limit?: number
  cursor?: string
}

/**
 * Get paginated list of planner weeks
 */
export const getPlannerWeeks = async (
  params?: GetPlannerWeeksParams
): Promise<PlannerWeekPageResponse> => {
  const { data } = await api.get<PlannerWeekPageResponse>('/planner/weeks', {
    params,
  })
  return data
}

/**
 * Get a single planner week by ID
 */
export const getPlannerWeek = async (id: string): Promise<PlannerWeek> => {
  const { data } = await api.get<PlannerWeek>(`/planner/weeks/${id}`)
  return data
}

/**
 * Create a new planner week
 */
export const createPlannerWeek = async (
  request: CreatePlannerWeekRequest
): Promise<PlannerWeek> => {
  const { data } = await api.post<PlannerWeek>('/planner/weeks', request)
  return data
}

/**
 * Update an existing planner week
 */
export const updatePlannerWeek = async (
  id: string,
  request: UpdatePlannerWeekRequest
): Promise<PlannerWeek> => {
  const { data } = await api.patch<PlannerWeek>(`/planner/weeks/${id}`, request)
  return data
}

/**
 * Delete a planner week
 */
export const deletePlannerWeek = async (id: string): Promise<void> => {
  await api.delete(`/planner/weeks/${id}`)
}

/**
 * Get the Monday of the current week
 */
export const getMondayOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff))
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Get all dates for a week starting from Monday
 */
export const getWeekDates = (monday: Date): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date)
  }
  return dates
}
