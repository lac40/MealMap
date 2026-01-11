/**
 * Recipe Template Service
 * 
 * API service layer for recipe template operations.
 * Handles all HTTP requests to the /templates endpoint.
 */

import api from '@/lib/api'
import type { RecipeItem } from '@/types/api'

export interface RecipeTemplate {
  id: string
  name: string
  description?: string
  tags: string[]
  dietaryTags: string[]
  source: 'global' | 'user'
  ownerUserId?: string
  favorite: boolean
  hidden: boolean
  immutable: boolean
  items: RecipeItem[]
  createdAt: string
  updatedAt: string
}

export interface GetRecipeTemplatesParams {
  limit?: number
  cursor?: string
  search?: string
}

export interface PaginatedRecipeTemplatesResponse {
  data: RecipeTemplate[]
  nextCursor: string | null
}

export const getRecipeTemplates = async (
  params?: GetRecipeTemplatesParams
): Promise<PaginatedRecipeTemplatesResponse> => {
  const response = await api.get<PaginatedRecipeTemplatesResponse>('/templates', {
    params: params
      ? {
          limit: params.limit,
          cursor: params.cursor,
          q: params.search,
        }
      : undefined,
  })
  return response.data
}

export const getRecipeTemplate = async (id: string): Promise<RecipeTemplate> => {
  const response = await api.get<RecipeTemplate>(`/templates/${id}`)
  return response.data
}

export interface DuplicateTemplateDto {
  name?: string
}

export const duplicateTemplate = async (
  id: string,
  data?: DuplicateTemplateDto
): Promise<any> => {
  const response = await api.post(`/templates/${id}/duplicate`, data || {})
  return response.data
}
