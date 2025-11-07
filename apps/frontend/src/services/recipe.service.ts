/**
 * Recipe Service
 * 
 * API service layer for recipe-related operations.
 * Handles all HTTP requests to the /recipes endpoint.
 * 
 * Features:
 * - CRUD operations for recipes
 * - Pagination support with cursor-based navigation
 * - Search functionality
 */

import api from '@/lib/api'
import type { Recipe, RecipeItem } from '@/types/api'

/**
 * Data Transfer Object for creating a recipe
 */
export interface CreateRecipeDto {
  name: string
  externalUrl?: string | null
  items: RecipeItem[]
}

/**
 * Data Transfer Object for updating a recipe
 * Extends CreateRecipeDto and adds the recipe ID
 */
export interface UpdateRecipeDto extends CreateRecipeDto {
  id: string
}

/**
 * Query parameters for fetching recipes
 */
export interface GetRecipesParams {
  limit?: number      // Maximum number of recipes to return
  cursor?: string     // Pagination cursor for fetching next page
  search?: string     // Search query to filter recipes by name
}

/**
 * Response structure for paginated recipe lists
 */
export interface PaginatedRecipesResponse {
  data: Recipe[]              // Array of recipe objects
  nextCursor: string | null   // Cursor for next page, null if no more pages
}

/**
 * Get paginated list of recipes
 * 
 * @param params - Optional query parameters (limit, cursor, search)
 * @returns Promise resolving to paginated recipe data
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
 * 
 * @param id - Unique identifier of the recipe
 * @returns Promise resolving to the recipe object
 */
export const getRecipe = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/recipes/${id}`)
  return response.data
}

/**
 * Create a new recipe
 * 
 * @param data - Recipe data including name, URL, and ingredient items
 * @returns Promise resolving to the created recipe object
 */
export const createRecipe = async (data: CreateRecipeDto): Promise<Recipe> => {
  const response = await api.post<Recipe>('/recipes', data)
  return response.data
}

/**
 * Update an existing recipe
 * 
 * @param data - Updated recipe data including the recipe ID
 * @returns Promise resolving to the updated recipe object
 */
export const updateRecipe = async (data: UpdateRecipeDto): Promise<Recipe> => {
  const { id, ...updateData } = data
  const response = await api.patch<Recipe>(`/recipes/${id}`, updateData)
  return response.data
}

/**
 * Delete a recipe
 * 
 * @param id - Unique identifier of the recipe to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`)
}
