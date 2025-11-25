/**
 * RecipesPage Component
 * 
 * Complete CRUD interface for managing recipes with the following features:
 * 
 * Key Features:
 * - List all recipes with pagination and search
 * - Create new recipes with multiple ingredients
 * - Edit existing recipes
 * - Delete recipes with confirmation
 * - Dynamic form with ingredient addition/removal
 * 
 * Technical Implementation:
 * - React Query for data fetching and mutations
 * - React Hook Form for form state management
 * - Zod for form validation
 * - Field arrays for dynamic ingredient list
 * - Optimistic UI updates via cache invalidation
 * 
 * State Management:
 * - Server state: React Query (recipes, ingredients)
 * - Form state: React Hook Form
 * - UI state: Local useState (modal visibility, edit mode)
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Plus, Pen, Trash2, X, ExternalLink } from 'lucide-react'
import * as recipeService from '@/services/recipe.service'
import * as ingredientService from '@/services/ingredient.service'
import { getErrorMessage } from '@/lib/api'
import { recipeSchema, type RecipeFormData } from '@/lib/validation'
import type { Recipe } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import Select from '@/components/ui/Select'

const RecipesPage = () => {
  const queryClient = useQueryClient()
  
  // UI state management
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  /**
   * Fetch recipes with search functionality
   * React Query automatically caches and refetches when searchQuery changes
   */
  const {
    data: recipesData,
    isLoading: recipesLoading,
    error: recipesError,
  } = useQuery({
    queryKey: ['recipes', searchQuery],
    queryFn: () =>
      recipeService.getRecipes({
        search: searchQuery || undefined,
        limit: 50,
      }),
  })

  /**
   * Fetch ingredients for the form dropdown
   * Only fetches when form is open (enabled: isFormOpen)
   */
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients-all'],
    queryFn: () => ingredientService.getIngredients({ limit: 100 }),
    enabled: isFormOpen,
  })

  /**
   * Create recipe mutation
   * On success: invalidates recipes cache to trigger refetch
   */
  const createMutation = useMutation({
    mutationFn: recipeService.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  /**
   * Update recipe mutation
   * On success: invalidates recipes cache to trigger refetch
   */
  const updateMutation = useMutation({
    mutationFn: recipeService.updateRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  /**
   * Delete recipe mutation
   * On success: invalidates recipes cache to trigger refetch
   */
  const deleteMutation = useMutation({
    mutationFn: recipeService.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  /**
   * Form setup with React Hook Form and Zod validation
   * 
   * - zodResolver: Integrates Zod schema for validation
   * - defaultValues: Initial form state
   * - errors: Validation error messages
   */
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      externalUrl: '',
      items: [{ ingredientId: '', quantity: { amount: 1, unit: 'g' } }],
    },
  })

  /**
   * Field array for dynamic ingredient list
   * Provides methods to add/remove ingredient rows
   */
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  /**
   * Open form for creating a new recipe
   * Resets form to default state
   */
  const handleOpenForm = () => {
    setEditingRecipe(null)
    setServerError(null)
    reset({
      name: '',
      externalUrl: '',
      items: [{ ingredientId: '', quantity: { amount: 1, unit: 'g' } }],
    })
    setIsFormOpen(true)
  }

  /**
   * Open form for editing an existing recipe
   * Populates form with recipe data
   */
  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setServerError(null)
    reset({
      name: recipe.name,
      externalUrl: recipe.externalUrl || '',
      items: recipe.items.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        packageNote: item.packageNote,
      })),
    })
    setIsFormOpen(true)
  }

  /**
   * Close form and clear all state
   */
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRecipe(null)
    setServerError(null)
    reset()
  }

  /**
   * Form submission handler
   * Calls create or update mutation based on edit mode
   */
  const onSubmit = (data: RecipeFormData) => {
    setServerError(null)
    const recipeData: recipeService.CreateRecipeDto = {
      name: data.name,
      externalUrl: data.externalUrl || null,
      items: data.items.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        packageNote: item.packageNote,
      })),
    }

    if (editingRecipe) {
      updateMutation.mutate({ id: editingRecipe.id, ...recipeData })
    } else {
      createMutation.mutate(recipeData)
    }
  }

  /**
   * Delete recipe with confirmation dialog
   */
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  /**
   * Helper function to get ingredient name from ID
   * Used for displaying ingredient names in recipe cards
   */
  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredientsData?.data.find((i) => i.id === ingredientId)
    return ingredient?.name || 'Unknown'
  }

  const recipes = recipesData?.data || []
  const ingredients = ingredientsData?.data || []

  // Loading state
  if (recipesLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Recipes</h1>
          <p className="text-ink-600 dark:text-ink-400">Manage your recipe collection</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-ink-600 dark:text-ink-400">
            <div className="w-5 h-5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
            <p>Loading recipes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (recipesError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Recipes</h1>
          <p className="text-ink-600 dark:text-ink-400">Manage your recipe collection</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            Error loading recipes: {getErrorMessage(recipesError)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Recipes</h1>
        <p className="text-ink-600 dark:text-ink-400">Manage your recipe collection</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md p-4 border border-surface-200 dark:border-ink-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-ink-500" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-surface-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <Button onClick={handleOpenForm}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            Add Recipe
          </Button>
        </div>
      </div>

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl p-12 text-center border border-surface-200 dark:border-ink-700">
          <p className="text-ink-700 dark:text-ink-300 text-lg mb-4">No recipes yet</p>
          <p className="text-ink-600 dark:text-ink-400 mb-6">
            Start building your recipe collection
          </p>
          <Button onClick={handleOpenForm}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            Create Your First Recipe
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-surface-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-ink-900 dark:text-ink-50 text-lg mb-2">
                    {recipe.name}
                  </h3>
                  {recipe.externalUrl && (
                    <a
                      href={recipe.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Original
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(recipe)}
                    aria-label="Edit recipe"
                    className="p-2 text-ink-600 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <Pen className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id, recipe.name)}
                    aria-label="Delete recipe"
                    className="p-2 text-ink-600 dark:text-ink-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                  Ingredients ({recipe.items.length}):
                </p>
                <ul className="space-y-1">
                  {recipe.items.slice(0, 5).map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-ink-600 dark:text-ink-400 flex items-start gap-2"
                    >
                      <span className="text-ink-400 dark:text-ink-500">•</span>
                      <span>
                        {item.quantity.amount} {item.quantity.unit}{' '}
                        {getIngredientName(item.ingredientId)}
                      </span>
                    </li>
                  ))}
                  {recipe.items.length > 5 && (
                    <li className="text-sm text-ink-500 dark:text-ink-400 italic">
                      + {recipe.items.length - 5} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-surface-200 dark:border-ink-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  aria-label="Close"
                  className="p-2 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {serverError && (
                <div
                  className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Recipe Name"
                    placeholder="e.g., Spaghetti Carbonara"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />

                  <Input
                    label="External URL (Optional)"
                    type="url"
                    placeholder="https://example.com/recipe"
                    helperText="Link to the original recipe"
                    error={errors.externalUrl?.message}
                    {...register('externalUrl')}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-ink-900">
                        Ingredients <span className="text-danger-600">*</span>
                      </label>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          append({
                            ingredientId: '',
                            quantity: { amount: 1, unit: 'g' },
                          })
                        }
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add Ingredient
                      </Button>
                    </div>

                    {errors.items?.message && (
                      <p className="text-sm text-danger-600 mb-2">
                        {errors.items.message}
                      </p>
                    )}

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-2 items-start p-3 bg-surface-50 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select
                              label="Ingredient"
                              error={
                                errors.items?.[index]?.ingredientId?.message
                              }
                              required
                              options={ingredients.map((ing) => ({
                                value: ing.id,
                                label: ing.name,
                              }))}
                              {...register(`items.${index}.ingredientId`)}
                            />

                            <Input
                              label="Amount"
                              type="number"
                              step="0.01"
                              placeholder="0"
                              error={
                                errors.items?.[index]?.quantity?.amount?.message
                              }
                              required
                              {...register(`items.${index}.quantity.amount`, {
                                valueAsNumber: true,
                              })}
                            />

                            <Select
                              label="Unit"
                              error={
                                errors.items?.[index]?.quantity?.unit?.message
                              }
                              required
                              options={[
                                { value: 'g', label: 'g' },
                                { value: 'kg', label: 'kg' },
                                { value: 'ml', label: 'ml' },
                                { value: 'l', label: 'l' },
                                { value: 'piece', label: 'piece' },
                                { value: 'pack', label: 'pack' },
                              ]}
                              {...register(`items.${index}.quantity.unit`)}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            aria-label="Remove ingredient"
                            className="mt-7 p-2 text-ink-700 hover:text-danger-600 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-ink-700">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipesPage
