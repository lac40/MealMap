export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'

export type MealSlot = 'breakfast' | 'snackAM' | 'lunch' | 'snackPM' | 'dinner'

export type UserRole = 'personal' | 'household' | 'coach'

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  createdAt: string
  householdId?: string
  mfaEnabled: boolean
  emailVerified: boolean
}

export interface Profile {
  userId: string
  role: UserRole
  mealSlots: MealSlot[]
}

export interface Household {
  id: string
  name: string
  adminId: string
  members: User[]
  createdAt: string
}

export interface PackageSize {
  amount: number
  unit: Unit
}

export interface Quantity {
  amount: number
  unit: Unit
}

export interface Category {
  id: string
  name: string
  sortOrder?: number
}

export interface Ingredient {
  id: string
  ownerUserId: string
  name: string
  categoryId: string
  defaultUnit: Unit
  packageSize: PackageSize
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface RecipeItem {
  ingredientId: string
  quantity: Quantity
  packageNote?: string
}

export interface Recipe {
  id: string
  name: string
  externalUrl?: string | null
   notes?: string | null
  items: RecipeItem[]
  createdAt: string
  updatedAt: string
}

export interface PlannerItem {
  id: string
  date: string
  slot: MealSlot
  recipeId?: string | null
  adHocItems: RecipeItem[]
  portions: number
  addedByUserId: string
}

export interface PlannerWeek {
  id: string
  startDate: string
  householdId?: string | null
  items: PlannerItem[]
  createdAt: string
  updatedAt: string
}

export interface PantryItem {
  id: string
  ingredientId: string
  quantity: Quantity
  updatedAt: string
}

export interface GroceryItem {
  ingredientId: string
  needed: Quantity
  afterPantry: Quantity
  categoryId: string
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
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor?: string | null
}

export interface Problem {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId?: string
  errors?: Record<string, string[]>
}
