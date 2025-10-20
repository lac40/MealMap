import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'

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

  const ingredients = ingredientsData?.data || []
  const isLoading = isLoadingIngredients || isLoadingCategories
  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-surface-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Ingredients</h1>
          <p className="text-ink-700">Manage your ingredient library</p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-700" />
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-button border border-divider-200 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-700 z-10 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-button border border-divider-200 appearance-none focus:outline-none focus:ring-2 focus:ring-secondary-600"
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
          </CardContent>
        </Card>

        {/* Ingredients List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-ink-700">Loading ingredients...</p>
          </div>
        ) : ingredientsError ? (
          <Card>
            <CardContent className="p-6 text-center text-danger-600">
              Error loading ingredients: {getErrorMessage(ingredientsError)}
            </CardContent>
          </Card>
        ) : ingredients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-ink-700 opacity-50" />
              <p className="text-ink-700 mb-4">
                {searchQuery || selectedCategory
                  ? 'No ingredients found matching your filters'
                  : 'No ingredients yet'}
              </p>
              <Button onClick={() => handleOpenForm()}>Add Your First Ingredient</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((ingredient) => (
              <Card key={ingredient.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                      <Chip variant="info" className="mt-2">
                        {getCategoryName(ingredient.categoryId)}
                      </Chip>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenForm(ingredient)}
                        className="p-2 text-ink-700 hover:text-secondary-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary-600"
                        aria-label="Edit ingredient"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-2 text-ink-700 hover:text-danger-600 rounded focus:outline-none focus:ring-2 focus:ring-danger-600"
                        aria-label="Delete ingredient"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-ink-700">
                    <div>
                      <span className="font-medium">Default Unit:</span>{' '}
                      {ingredient.defaultUnit}
                    </div>
                    <div>
                      <span className="font-medium">Package Size:</span>{' '}
                      {ingredient.packageSize.amount} {ingredient.packageSize.unit}
                    </div>
                    {ingredient.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>{' '}
                        <span className="text-ink-700">{ingredient.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseForm}
          >
            <div
              className="bg-white rounded-card shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-ink-900">
                    {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 text-ink-700 hover:text-ink-900 rounded focus:outline-none focus:ring-2 focus:ring-secondary-600"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {serverError && (
                  <div
                    className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger-600"
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
    </div>
  )
}

export default IngredientsPage
