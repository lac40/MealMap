import api from '../lib/api'

export interface Quantity {
  amount: number
  unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
}

export interface GroceryItem {
  ingredientId: string
  ingredientName?: string
  categoryId: string
  categoryName?: string
  needed: Quantity
  afterPantry: Quantity
  checked: boolean
}

export interface GroceryTrip {
  tripIndex: number
  dateRange: {
    from: string
    to: string
  }
  items: GroceryItem[]
}

export interface GroceryList {
  id: string
  planWeekId: string
  trips: GroceryTrip[]
  createdAt: string
  updatedAt?: string
}

export interface ComputeGroceryRequest {
  planWeekId: string
  trips?: number
  splitRule?: 'Sun-Wed_Thu-Sun' | 'custom'
  customSplits?: Array<{
    from: string
    to: string
  }>
}

export interface UpdateGroceryListRequest {
  trips: Array<{
    tripIndex: number
    items: GroceryItem[]
  }>
}

export const computeGroceryList = async (request: ComputeGroceryRequest): Promise<GroceryList> => {
  const response = await api.post('/grocery/compute', request)
  return response.data
}

export const updateGroceryList = async (id: string, request: UpdateGroceryListRequest): Promise<GroceryList> => {
  const response = await api.patch(`/grocery/lists/${id}`, request)
  return response.data
}

export const getGroceryListById = async (id: string): Promise<GroceryList> => {
  const response = await api.get(`/grocery/lists/${id}`)
  return response.data
}
