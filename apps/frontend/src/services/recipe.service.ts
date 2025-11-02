import api from '@/lib/api'
import type { Recipe, RecipeItem } from '@/types/api'

export interface CreateRecipeDto {
  name: string
  externalUrl?: string | null
  items: RecipeItem[]
}

export interface UpdateRecipeDto extends CreateRecipeDto {
  id: string
}

export interface GetRecipesParams {
  limit?: number
  cursor?: string
  search?: string
}

export interface PaginatedRecipesResponse {
  data: Recipe[]
  nextCursor: string | null
}

/**
 * Get paginated list of recipes
 */
export const getRecipes = async (
  params?: GetRecipesParams
): Promise<PaginatedRecipesResponse> => {
  const response = await api.get<PaginatedRecipesResponse>('/recipes', {
    params,
  })
  return response.data
}

/**
 * Get a single recipe by ID
 */
export const getRecipe = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/recipes/${id}`)
  return response.data
}

/**
 * Create a new recipe
 */
export const createRecipe = async (data: CreateRecipeDto): Promise<Recipe> => {
  const response = await api.post<Recipe>('/recipes', data)
  return response.data
}

/**
 * Update an existing recipe
 */
export const updateRecipe = async (data: UpdateRecipeDto): Promise<Recipe> => {
  const { id, ...updateData } = data
  const response = await api.patch<Recipe>(`/recipes/${id}`, updateData)
  return response.data
}

/**
 * Delete a recipe
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`)
}
