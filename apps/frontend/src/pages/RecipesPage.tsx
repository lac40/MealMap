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
import { Search, Plus, Pen, Trash2, X, ExternalLink, BookOpen, Copy } from 'lucide-react'
import * as recipeService from '@/services/recipe.service'
import * as recipeTemplateService from '@/services/recipeTemplate.service'
import * as ingredientService from '@/services/ingredient.service'
import { getErrorMessage } from '@/lib/api'
import { recipeSchema, type RecipeFormData } from '@/lib/validation'
import type { Recipe } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import Select from '@/components/ui/Select'

const RecipesPage = () => {
  const queryClient = useQueryClient()
  
  // UI state management
  const [view, setView] = useState<'recipes' | 'templates'>('recipes')
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
   * Fetch recipe templates
   */
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['recipeTemplates', searchQuery],
    queryFn: () =>
      recipeTemplateService.getRecipeTemplates({
        search: searchQuery || undefined,
        limit: 50,
      }),
    enabled: view === 'templates',
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
   * Duplicate template to create a new recipe
   */
  const duplicateTemplateMutation = useMutation({
    mutationFn: (id: string) => recipeTemplateService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      // Switch to recipes view to see the new recipe
      setView('recipes')
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
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      externalUrl: '',
      notes: '',
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
      notes: '',
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
      notes: recipe.notes || '',
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
      notes: data.notes || null,
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
  const templates = templatesData?.data || []
  const ingredients = ingredientsData?.data || []

  // Loading state
  if (view === 'recipes' && recipesLoading) {
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

  if (view === 'templates' && templatesLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Recipe Templates</h1>
          <p className="text-ink-600 dark:text-ink-400">Browse and use recipe templates</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-ink-600 dark:text-ink-400">
            <div className="w-5 h-5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
            <p>Loading templates...</p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'recipes' && recipesError) {
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

  if (view === 'templates' && templatesError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Recipe Templates</h1>
          <p className="text-ink-600 dark:text-ink-400">Browse and use recipe templates</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            Error loading templates: {getErrorMessage(templatesError)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">
          {view === 'recipes' ? 'Recipes' : 'Recipe Templates'}
        </h1>
        <p className="text-ink-600 dark:text-ink-400">
          {view === 'recipes' ? 'Manage your recipe collection' : 'Browse and use recipe templates'}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 bg-surface-50 dark:bg-ink-800 p-1 rounded-xl border border-surface-200 dark:border-ink-700 w-fit">
        <button
          onClick={() => setView('recipes')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'recipes'
              ? 'bg-primary-600 text-white'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50'
          }`}
        >
          My Recipes
        </button>
        <button
          onClick={() => setView('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'templates'
              ? 'bg-primary-600 text-white'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Templates
        </button>
      </div>

      {/* Search and Actions */}
      <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md p-4 border border-surface-200 dark:border-ink-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-ink-500" />
              <input
                type="text"
                placeholder={view === 'recipes' ? 'Search recipes...' : 'Search templates...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-surface-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          {view === 'recipes' && (
            <Button onClick={handleOpenForm}>
              <Plus className="h-5 w-5" aria-hidden="true" />
              Add Recipe
            </Button>
          )}
        </div>
      </div>

      {/* Content based on view */}
      {view === 'recipes' ? (
        /* Recipes List */
        recipes.length === 0 ? (
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

              <div className="mt-4 border-t border-surface-200 dark:border-ink-700 pt-3">
                <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">Notes</p>
                {recipe.notes ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-ink-700 dark:text-ink-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe.notes}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-ink-500 dark:text-ink-400 italic">No notes yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        /* Templates List */
        templates.length === 0 ? (
          <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl p-12 text-center border border-surface-200 dark:border-ink-700">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-ink-400 dark:text-ink-500" />
            <p className="text-ink-700 dark:text-ink-300 text-lg mb-2">No templates found</p>
            <p className="text-ink-600 dark:text-ink-400">
              {searchQuery ? 'Try a different search term' : 'Templates will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-surface-200 dark:border-ink-700 p-5 hover:shadow-md dark:hover:shadow-xl dark:hover:border-primary-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-50 mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {template.source === 'global' && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                        Global Template
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => duplicateTemplateMutation.mutate(template.id)}
                    disabled={duplicateTemplateMutation.isPending}
                    variant="secondary"
                    size="sm"
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                    Ingredients ({template.items.length}):
                  </p>
                  <ul className="space-y-1">
                    {template.items.slice(0, 5).map((item, idx) => (
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
                    {template.items.length > 5 && (
                      <li className="text-sm text-ink-500 dark:text-ink-400 italic">
                        +{template.items.length - 5} more...
                      </li>
                    )}
                  </ul>
                </div>

                {(template.tags || template.dietaryTags) && (
                  <div className="mt-3 pt-3 border-t border-surface-200 dark:border-ink-700">
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.map((tag: string, idx: number) => (
                        <span
                          key={`tag-${idx}`}
                          className="px-2 py-0.5 bg-surface-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 text-xs rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                      {template.dietaryTags?.map((tag: string, idx: number) => (
                        <span
                          key={`dietary-${idx}`}
                          className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink-900 dark:text-ink-100">
                      Notes (Markdown supported)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Add personal notes, tweaks, or serving tips"
                      className="w-full rounded-lg border border-surface-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register('notes')}
                    />
                    {errors.notes?.message && (
                      <p className="text-sm text-danger-600">{errors.notes.message}</p>
                    )}
                    <div className="bg-surface-100 dark:bg-ink-900 border border-surface-200 dark:border-ink-700 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
                        Live Preview
                      </p>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-ink-800 dark:text-ink-100">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {watch('notes') || 'Nothing yet—start typing notes.'}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

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
