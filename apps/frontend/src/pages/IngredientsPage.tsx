import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Filter,
  Package,
} from 'lucide-react'
import {
  getIngredients,
  getCategories,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type CreateIngredientDto,
} from '@/services/ingredient.service'
import { ingredientSchema, type IngredientFormData } from '@/lib/validation'
import { getErrorMessage } from '@/lib/api'
import type { Ingredient } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const SYSTEM_TEMPLATE_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

const IngredientsPage = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  // Fetch ingredients
  const {
    data: ingredientsData,
    isLoading: isLoadingIngredients,
    error: ingredientsError,
  } = useQuery({
    queryKey: ['ingredients', searchQuery, selectedCategory],
    queryFn: () =>
      getIngredients({
        q: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
      }),
  })

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: editingIngredient
      ? {
          name: editingIngredient.name,
          categoryId: editingIngredient.categoryId,
          defaultUnit: editingIngredient.defaultUnit,
          packageAmount: editingIngredient.packageSize.amount,
          packageUnit: editingIngredient.packageSize.unit,
          notes: editingIngredient.notes || '',
        }
      : undefined,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateIngredientDto) => createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string } & CreateIngredientDto) =>
      updateIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  const handleOpenForm = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient)
      reset({
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        defaultUnit: ingredient.defaultUnit,
        packageAmount: ingredient.packageSize.amount,
        packageUnit: ingredient.packageSize.unit,
        notes: ingredient.notes || '',
      })
    } else {
      setEditingIngredient(null)
      reset({
        name: '',
        categoryId: '',
        defaultUnit: 'g',
        packageAmount: 0,
        packageUnit: 'g',
        notes: '',
      })
    }
    setServerError(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingIngredient(null)
    setServerError(null)
    reset()
  }

  const onSubmit = (data: IngredientFormData) => {
    setServerError(null)
    const ingredientData: CreateIngredientDto = {
      name: data.name,
      categoryId: data.categoryId,
      defaultUnit: data.defaultUnit,
      packageSize: {
        amount: data.packageAmount,
        unit: data.packageUnit,
      },
      notes: data.notes,
    }

    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient.id, ...ingredientData })
    } else {
      createMutation.mutate(ingredientData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      deleteMutation.mutate(id)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const isBaseIngredient = (ingredient: Ingredient) => {
    return ingredient.ownerUserId === SYSTEM_TEMPLATE_USER_ID
  }

  const ingredients = ingredientsData?.data || []
  const isLoading = isLoadingIngredients || isLoadingCategories
  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Ingredients</h1>
        <p className="text-muted-foreground">Manage your ingredient library</p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-muted rounded-2xl shadow-md p-4 border border-border"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={() => handleOpenForm()}
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Add Ingredient
          </Button>
        </div>
      </motion.div>

      {/* Ingredients List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
            <p>Loading ingredients...</p>
          </div>
        </div>
      ) : ingredientsError ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            Error loading ingredients: {getErrorMessage(ingredientsError)}
          </p>
        </div>
      ) : ingredients.length === 0 ? (
        <div className="bg-muted rounded-2xl p-12 text-center border border-border">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-foreground mb-4">
            {searchQuery || selectedCategory
              ? 'No ingredients found matching your filters'
              : 'No ingredients yet'}
          </p>
          <Button onClick={() => handleOpenForm()}>Add Your First Ingredient</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => {
            const isBase = isBaseIngredient(ingredient)
            return (
              <div
                key={ingredient.id}
                className="bg-muted rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-border hover:border-primary-300 dark:hover:border-primary-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {ingredient.name}
                      </h3>
                      {isBase && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          Base
                        </span>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {getCategoryName(ingredient.categoryId)}
                    </span>
                  </div>
                  {!isBase && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenForm(ingredient)}
                        className="p-2 text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Edit ingredient"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Delete ingredient"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Default Unit:</span>{' '}
                  {ingredient.defaultUnit}
                </div>
                <div>
                  <span className="font-medium text-foreground">Package Size:</span>{' '}
                  {ingredient.packageSize.amount} {ingredient.packageSize.unit}
                </div>
                {ingredient.notes && (
                  <div>
                    <span className="font-medium text-foreground">Notes:</span>{' '}
                    <span>{ingredient.notes}</span>
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}

        {/* Form Modal */}
        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={handleCloseForm}
          >
            <div
              className="bg-muted rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Close"
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Ingredient Name"
                    placeholder="e.g., Tomato, Olive Oil"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />

                  <Select
                    label="Category"
                    error={errors.categoryId?.message}
                    required
                    options={categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    {...register('categoryId')}
                  />

                  <Select
                    label="Default Unit"
                    error={errors.defaultUnit?.message}
                    helperText="The unit you typically use for this ingredient"
                    required
                    options={[
                      { value: 'g', label: 'Grams (g)' },
                      { value: 'kg', label: 'Kilograms (kg)' },
                      { value: 'ml', label: 'Milliliters (ml)' },
                      { value: 'l', label: 'Liters (l)' },
                      { value: 'piece', label: 'Piece' },
                      { value: 'pack', label: 'Pack' },
                    ]}
                    {...register('defaultUnit')}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Package Amount"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      error={errors.packageAmount?.message}
                      required
                      {...register('packageAmount', { valueAsNumber: true })}
                    />

                    <Select
                      label="Package Unit"
                      error={errors.packageUnit?.message}
                      required
                      options={[
                        { value: 'g', label: 'Grams (g)' },
                        { value: 'kg', label: 'Kilograms (kg)' },
                        { value: 'ml', label: 'Milliliters (ml)' },
                        { value: 'l', label: 'Liters (l)' },
                        { value: 'piece', label: 'Piece' },
                        { value: 'pack', label: 'Pack' },
                      ]}
                      {...register('packageUnit')}
                    />
                  </div>

                  <Input
                    label="Notes"
                    placeholder="Optional notes about this ingredient"
                    error={errors.notes?.message}
                    {...register('notes')}
                  />

                <div className="flex gap-3 pt-4">
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
                    isLoading={isSaving}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {editingIngredient ? 'Update' : 'Create'} Ingredient
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

export default IngredientsPage
