import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import {
  getPlannerWeeks,
  createPlannerWeek,
  updatePlannerWeek,
  getMondayOfWeek,
  formatDate,
  getWeekDates,
  type MealSlot,
  type PlannerWeek,
  type PlannerItem,
  type CreatePlannerItemRequest,
} from '@/services/planner.service'
import { getRecipes } from '@/services/recipe.service'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'

const PlannerPage = () => {
  const queryClient = useQueryClient()
  const [currentMonday, setCurrentMonday] = useState<Date>(getMondayOfWeek())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date
    slot: MealSlot
  } | null>(null)
  const [currentWeek, setCurrentWeek] = useState<PlannerWeek | null>(null)

  const weekDates = getWeekDates(currentMonday)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealSlots: { key: MealSlot; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'snackAM', label: 'Snack AM' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'snackPM', label: 'Snack PM' },
    { key: 'dinner', label: 'Dinner' },
  ]

  // Fetch planner weeks
  const { data: weeksData, isLoading } = useQuery({
    queryKey: ['planner-weeks', formatDate(currentMonday)],
    queryFn: () =>
      getPlannerWeeks({
        from: formatDate(currentMonday),
        to: formatDate(new Date(currentMonday.getTime() + 6 * 24 * 60 * 60 * 1000)),
      }),
  })

  // Fetch recipes for the modal
  const { data: recipesData } = useQuery({
    queryKey: ['recipes-all'],
    queryFn: () => getRecipes({ limit: 100 }),
    enabled: isAddModalOpen,
  })

  // Update current week when data changes
  useEffect(() => {
    if (weeksData?.data && weeksData.data.length > 0) {
      setCurrentWeek(weeksData.data[0])
    } else {
      setCurrentWeek(null)
    }
  }, [weeksData])

  // Create week mutation
  const createWeekMutation = useMutation({
    mutationFn: createPlannerWeek,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-weeks'] })
    },
  })

  // Update week mutation
  const updateWeekMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: CreatePlannerItemRequest[] }) =>
      updatePlannerWeek(id, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-weeks'] })
    },
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!currentWeek) return

      const updatedItems = currentWeek.items
        .filter((item) => item.id !== itemId)
        .map((item) => ({
          date: item.date,
          slot: item.slot,
          recipeId: item.recipeId || undefined,
          portions: item.portions,
        }))

      await updatePlannerWeek(currentWeek.id, { items: updatedItems })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-weeks'] })
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    recipeId: string
    portions: number
  }>()

  const handlePreviousWeek = () => {
    const newMonday = new Date(currentMonday)
    newMonday.setDate(currentMonday.getDate() - 7)
    setCurrentMonday(newMonday)
  }

  const handleNextWeek = () => {
    const newMonday = new Date(currentMonday)
    newMonday.setDate(currentMonday.getDate() + 7)
    setCurrentMonday(newMonday)
  }

  const handleOpenAddModal = (date: Date, slot: MealSlot) => {
    setSelectedSlot({ date, slot })
    reset({ recipeId: '', portions: 1 })
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setSelectedSlot(null)
  }

  const handleAddMeal = async (formData: { recipeId: string; portions: number }) => {
    if (!selectedSlot) return

    const newItem: CreatePlannerItemRequest = {
      date: formatDate(selectedSlot.date),
      slot: selectedSlot.slot,
      recipeId: formData.recipeId || undefined,
      portions: formData.portions,
    }

    if (currentWeek) {
      // Update existing week
      const existingItems = currentWeek.items.map((item) => ({
        date: item.date,
        slot: item.slot,
        recipeId: item.recipeId || undefined,
        portions: item.portions,
      }))
      await updateWeekMutation.mutateAsync({
        id: currentWeek.id,
        items: [...existingItems, newItem],
      })
    } else {
      // Create new week
      await createWeekMutation.mutateAsync({
        startDate: formatDate(currentMonday),
        items: [newItem],
      })
    }

    handleCloseAddModal()
  }

  const getItemsForSlot = (date: Date, slot: MealSlot): PlannerItem[] => {
    if (!currentWeek) return []
    const dateStr = formatDate(date)
    return currentWeek.items.filter((item) => item.date === dateStr && item.slot === slot)
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this meal?')) {
      deleteItemMutation.mutate(itemId)
    }
  }

  const recipes = recipesData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50 mb-6">Weekly Planner</h1>
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-ink-600 dark:text-ink-400">
            <div className="w-5 h-5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
            <p>Loading planner...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50 mb-2">Weekly Planner</h1>
          <p className="text-ink-600 dark:text-ink-400">
            Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePreviousWeek} leftIcon={<ChevronLeft />}>
            Previous
          </Button>
          <Button variant="secondary" onClick={handleNextWeek} rightIcon={<ChevronRight />}>
            Next
          </Button>
        </div>
      </div>

      {/* Planner Grid */}
      <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md overflow-x-auto border border-surface-200 dark:border-ink-700">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 gap-px bg-surface-300 dark:bg-ink-600">
            <div className="bg-surface-100 dark:bg-ink-750 p-4 font-semibold text-ink-900 dark:text-ink-50">Meal</div>
            {days.map((day, index) => (
              <div key={day} className="bg-surface-100 dark:bg-ink-750 p-4 font-semibold text-center text-ink-900 dark:text-ink-50">
                <div>{day}</div>
                <div className="text-sm text-ink-600 dark:text-ink-400 font-normal">
                  {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {/* Meal Slots */}
          {mealSlots.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-8 gap-px bg-surface-300 dark:bg-ink-600">
              <div className="bg-surface-50 dark:bg-ink-800 p-4 font-medium text-ink-800 dark:text-ink-200">{label}</div>
              {weekDates.map((date) => {
                const items = getItemsForSlot(date, key)
                return (
                  <div
                    key={`${formatDate(date)}-${key}`}
                    className="bg-surface-50 dark:bg-ink-800 p-2 min-h-[100px] hover:bg-surface-100 dark:hover:bg-ink-750 transition-colors"
                  >
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-lg p-2 text-sm"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-ink-900 dark:text-ink-50 truncate">
                                {item.recipeName || 'Custom Meal'}
                              </div>
                              <div className="text-ink-600 dark:text-ink-400">{item.portions} portions</div>
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-ink-600 dark:text-ink-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 transition-colors"
                              aria-label="Remove meal"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => handleOpenAddModal(date, key)}
                        className="w-full p-2 border-2 border-dashed border-surface-300 dark:border-ink-600 rounded-lg text-ink-600 dark:text-ink-400 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      {isAddModalOpen && selectedSlot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={handleCloseAddModal}
        >
          <div
            className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-2xl max-w-md w-full border border-surface-200 dark:border-ink-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">Add Meal</h2>
                <button
                  onClick={handleCloseAddModal}
                  className="p-2 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleAddMeal)} className="space-y-4">
                <div>
                  <p className="text-sm text-ink-600 dark:text-ink-400 mb-4">
                    <strong className="text-ink-700 dark:text-ink-300">Date:</strong> {selectedSlot.date.toLocaleDateString()}<br />
                    <strong className="text-ink-700 dark:text-ink-300">Meal Slot:</strong> {mealSlots.find(s => s.key === selectedSlot.slot)?.label}
                  </p>
                </div>

                  <Select
                    label="Recipe"
                    helperText="Leave empty for a custom meal"
                    options={[
                      { value: '', label: 'Custom Meal' },
                      ...recipes.map((recipe) => ({
                        value: recipe.id,
                        label: recipe.name,
                      })),
                    ]}
                    {...register('recipeId')}
                  />

                  <Input
                    label="Portions"
                    type="number"
                    min="1"
                    error={errors.portions?.message}
                    required
                    {...register('portions', { valueAsNumber: true, required: 'Portions is required', min: 1 })}
                  />

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={handleCloseAddModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={createWeekMutation.isPending || updateWeekMutation.isPending}
                  >
                    Add Meal
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

export default PlannerPage
