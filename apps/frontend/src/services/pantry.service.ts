import api from '@/lib/api'

export interface Quantity {
  amount: number
  unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
}

export interface PantryItem {
  id: string
  ingredientId: string
  ingredientName: string
  categoryId: string
  categoryName: string
  quantity: Quantity
  userId: string | null
  householdId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePantryItemRequest {
  ingredientId: string
  quantity: Quantity
  householdId?: string
}

export interface UpdatePantryItemRequest {
  quantity: Quantity
}

export interface PantryItemPageResponse {
  data: PantryItem[]
  nextCursor: string | null
}

export interface GetPantryItemsParams {
  limit?: number
  cursor?: string
}

/**
 * Get paginated list of pantry items
 */
export const getPantryItems = async (
  params?: GetPantryItemsParams
): Promise<PantryItemPageResponse> => {
  const { data } = await api.get<PantryItemPageResponse>('/pantry', {
    params,
  })
  return data
}

/**
 * Get a single pantry item by ID
 */
export const getPantryItem = async (id: string): Promise<PantryItem> => {
  const { data } = await api.get<PantryItem>(`/pantry/${id}`)
  return data
}

/**
 * Create a new pantry item
 */
export const createPantryItem = async (
  request: CreatePantryItemRequest
): Promise<PantryItem> => {
  const { data } = await api.post<PantryItem>('/pantry', request)
  return data
}

/**
 * Update an existing pantry item
 */
export const updatePantryItem = async (
  id: string,
  request: UpdatePantryItemRequest
): Promise<PantryItem> => {
  const { data } = await api.patch<PantryItem>(`/pantry/${id}`, request)
  return data
}

/**
 * Delete a pantry item
 */
export const deletePantryItem = async (id: string): Promise<void> => {
  await api.delete(`/pantry/${id}`)
}
