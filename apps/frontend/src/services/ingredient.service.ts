import api from '@/lib/api'
import type { Ingredient, PaginatedResponse, Category } from '@/types/api'

export interface CreateIngredientDto {
  name: string
  categoryId: string
  defaultUnit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
  packageSize: {
    amount: number
    unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
  }
  notes?: string
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {
  id: string
}

export interface GetIngredientsParams {
  limit?: number
  cursor?: string
  q?: string // search by name
  categoryId?: string
  updatedSince?: string
}

/**
 * Get paginated list of user's ingredients
 */
export const getIngredients = async (
  params?: GetIngredientsParams
): Promise<PaginatedResponse<Ingredient>> => {
  const { data } = await api.get<PaginatedResponse<Ingredient>>('/ingredients', {
    params,
  })
  return data
}

/**
 * Get a single ingredient by ID
 */
export const getIngredient = async (id: string): Promise<Ingredient> => {
  const { data } = await api.get<Ingredient>(`/ingredients/${id}`)
  return data
}

/**
 * Create a new ingredient
 */
export const createIngredient = async (
  ingredient: CreateIngredientDto
): Promise<Ingredient> => {
  const { data } = await api.post<Ingredient>('/ingredients', ingredient)
  return data
}

/**
 * Update an existing ingredient
 */
export const updateIngredient = async (
  ingredient: UpdateIngredientDto
): Promise<Ingredient> => {
  const { id, ...updateData } = ingredient
  const { data } = await api.patch<Ingredient>(`/ingredients/${id}`, updateData)
  return data
}

/**
 * Delete an ingredient
 */
export const deleteIngredient = async (id: string): Promise<void> => {
  await api.delete(`/ingredients/${id}`)
}

/**
 * Get all categories (global, seeded)
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories')
  return data
}
