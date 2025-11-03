import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react'
import {
  getPantryItems,
  createPantryItem,
  updatePantryItem,
  deletePantryItem,
  type PantryItem,
  type CreatePantryItemRequest,
} from '@/services/pantry.service'
import { getIngredients } from '@/services/ingredient.service'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const PantryPage = () => {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  // Fetch pantry items
  const {
    data: pantryData,
    isLoading: isLoadingPantry,
    error: pantryError,
  } = useQuery({
    queryKey: ['pantry-items'],
    queryFn: () => getPantryItems({ limit: 100 }),
  })

  // Fetch ingredients for the form
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients-all'],
    queryFn: () => getIngredients({ limit: 100 }),
    enabled: isFormOpen,
  })

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    ingredientId: string
    amount: number
    unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
  }>()

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePantryItemRequest) => createPantryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: { amount: number; unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack' } }) =>
      updatePantryItem(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
      handleCloseForm()
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  const handleOpenForm = (item?: PantryItem) => {
    if (item) {
      setEditingItem(item)
      reset({
        ingredientId: item.ingredientId,
        amount: item.quantity.amount,
        unit: item.quantity.unit,
      })
    } else {
      setEditingItem(null)
      reset({
        ingredientId: '',
        amount: 0,
        unit: 'g',
      })
    }
    setServerError(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    setServerError(null)
    reset()
  }

  const onSubmit = (formData: {
    ingredientId: string
    amount: number
    unit: 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack'
  }) => {
    setServerError(null)

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        quantity: {
          amount: formData.amount,
          unit: formData.unit as 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'pack',
        },
      })
    } else {
      createMutation.mutate({
        ingredientId: formData.ingredientId,
        quantity: {
          amount: formData.amount,
          unit: formData.unit,
        },
      })
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your pantry?`)) {
      deleteMutation.mutate(id)
    }
  }

  const pantryItems = pantryData?.data || []
  const ingredients = ingredientsData?.data || []
  const isSaving = createMutation.isPending || updateMutation.isPending

  // Group items by category
  const itemsByCategory = pantryItems.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = []
    }
    acc[item.categoryName].push(item)
    return acc
  }, {} as Record<string, PantryItem[]>)

  if (isLoadingPantry) {
    return (
      <div className="min-h-screen bg-surface-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">Pantry</h1>
          <Card>
            <CardContent className="p-8 text-center text-ink-700">
              Loading pantry...
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (pantryError) {
    return (
      <div className="min-h-screen bg-surface-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">Pantry</h1>
          <Card>
            <CardContent className="p-8 text-center text-danger-600">
              Error loading pantry: {getErrorMessage(pantryError)}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink-900 mb-2">Pantry</h1>
            <p className="text-ink-700">Manage your ingredient inventory</p>
          </div>
          <Button onClick={() => handleOpenForm()} leftIcon={<Plus className="h-5 w-5" />}>
            Add Item
          </Button>
        </div>

        {/* Pantry Items */}
        {pantryItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-ink-700 opacity-50" />
              <p className="text-ink-700 text-lg mb-4">Your pantry is empty</p>
              <p className="text-ink-600 mb-6">Start adding ingredients to track your inventory</p>
              <Button onClick={() => handleOpenForm()}>Add Your First Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(itemsByCategory).map(([categoryName, items]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle>{categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-surface-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink-900 truncate">
                            {item.ingredientName}
                          </div>
                          <div className="text-sm text-ink-700">
                            {item.quantity.amount} {item.quantity.unit}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => handleOpenForm(item)}
                            className="p-2 text-ink-700 hover:text-secondary-600 rounded"
                            aria-label="Edit item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.ingredientName)}
                            className="p-2 text-ink-700 hover:text-danger-600 rounded"
                            aria-label="Delete item"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
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
              className="bg-white rounded-card shadow-elevated max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-ink-900">
                    {editingItem ? 'Update Pantry Item' : 'Add Pantry Item'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 text-ink-700 hover:text-ink-900 rounded"
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
                  <Select
                    label="Ingredient"
                    error={errors.ingredientId?.message}
                    required
                    disabled={!!editingItem}
                    options={ingredients.map((ing) => ({
                      value: ing.id,
                      label: ing.name,
                    }))}
                    {...register('ingredientId', { required: 'Ingredient is required' })}
                  />

                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    error={errors.amount?.message}
                    required
                    {...register('amount', {
                      valueAsNumber: true,
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                    })}
                  />

                  <Select
                    label="Unit"
                    error={errors.unit?.message}
                    required
                    options={[
                      { value: 'g', label: 'Grams (g)' },
                      { value: 'kg', label: 'Kilograms (kg)' },
                      { value: 'ml', label: 'Milliliters (ml)' },
                      { value: 'l', label: 'Liters (l)' },
                      { value: 'piece', label: 'Piece' },
                      { value: 'pack', label: 'Pack' },
                    ]}
                    {...register('unit', { required: 'Unit is required' })}
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
                      {editingItem ? 'Update' : 'Add'} Item
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

export default PantryPage
