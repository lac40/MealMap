import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  computeGroceryList,
  updateGroceryList,
  type GroceryList,
  type GroceryItem,
  type ComputeGroceryRequest,
} from '../services/grocery.service'
import { getPlannerWeeks } from '../services/planner.service'
import { ShoppingCart, Calendar, Download, Plus, Check } from 'lucide-react'

const GroceryPage = () => {
  const queryClient = useQueryClient()
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)

  // Fetch planner weeks for selection
  const { data: plannerWeeks } = useQuery({
    queryKey: ['plannerWeeks'],
    queryFn: () => getPlannerWeeks(),
  })

  const computeMutation = useMutation({
    mutationFn: (request: ComputeGroceryRequest) => computeGroceryList(request),
    onSuccess: (data) => {
      setGroceryList(data)
      setShowGenerateModal(false)
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: GroceryItem[][]; }) =>
      updateGroceryList(id, {
        trips: items.map((tripItems, index) => ({
          tripIndex: index,
          items: tripItems,
        })),
      }),
    onSuccess: (data) => {
      setGroceryList(data)
    },
  })

  const handleGenerateList = (planWeekId: string, trips: number = 2) => {
    computeMutation.mutate({
      planWeekId,
      trips,
      splitRule: 'Sun-Wed_Thu-Sun',
    })
  }

  const toggleItemChecked = (tripIndex: number, itemIndex: number) => {
    if (!groceryList) return

    const updatedTrips = [...groceryList.trips]
    const updatedItems = [...updatedTrips[tripIndex].items]
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      checked: !updatedItems[itemIndex].checked,
    }
    updatedTrips[tripIndex] = {
      ...updatedTrips[tripIndex],
      items: updatedItems,
    }

    const allTripItems = updatedTrips.map((trip) => trip.items)
    updateMutation.mutate({ id: groceryList.id, items: allTripItems })
  }

  // Group items by category
  const groupItemsByCategory = (items: GroceryItem[]) => {
    const grouped = items.reduce((acc, item) => {
      const category = item.categoryName || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, GroceryItem[]>)
    return grouped
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShoppingCart size={32} className="text-primary-600 dark:text-primary-400" />
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">Grocery List</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <Plus size={20} />
            Generate from Planner
          </button>
          {groceryList && (
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-300 dark:border-ink-600 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 text-ink-900 dark:text-ink-50 transition-colors">
              <Download size={20} />
              Export
            </button>
          )}
        </div>
      </div>

      {!groceryList && (
        <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md border border-surface-200 dark:border-ink-700">
          <div className="p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-ink-400 dark:text-ink-500 mb-4" />
            <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50 mb-2">No Grocery List Yet</h2>
            <p className="text-ink-600 dark:text-ink-400 mb-6">
              Generate a grocery list from your weekly planner to get started.
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Generate from Planner
            </button>
          </div>
        </div>
      )}

      {groceryList && (
        <div className="space-y-6">
          {groceryList.trips.map((trip, tripIndex) => (
            <div key={tripIndex} className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md border border-surface-200 dark:border-ink-700">
              <div className="p-4 border-b border-surface-200 dark:border-ink-700 bg-surface-100 dark:bg-ink-750">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                    Trip {trip.tripIndex + 1}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                    <Calendar size={16} />
                    <span>
                      {new Date(trip.dateRange.from).toLocaleDateString()} -{' '}
                      {new Date(trip.dateRange.to).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {trip.items.length === 0 ? (
                  <p className="text-center text-ink-500 dark:text-ink-400 py-4">No items for this trip</p>
                ) : (
                  Object.entries(groupItemsByCategory(trip.items)).map(([category, items]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3 uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const originalIndex = trip.items.findIndex(
                            (i) => i.ingredientId === item.ingredientId
                          )
                          return (
                            <div
                              key={item.ingredientId}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                item.checked
                                  ? 'bg-surface-100 dark:bg-ink-750 border-surface-200 dark:border-ink-600'
                                  : 'bg-white dark:bg-ink-900 border-surface-300 dark:border-ink-600 hover:border-primary-300 dark:hover:border-primary-600'
                              }`}
                            >
                              <button
                                onClick={() => toggleItemChecked(tripIndex, originalIndex)}
                                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  item.checked
                                    ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
                                    : 'border-surface-300 dark:border-ink-500 hover:border-primary-500 dark:hover:border-primary-400'
                                }`}
                              >
                                {item.checked && <Check size={16} className="text-white" />}
                              </button>
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    item.checked ? 'text-ink-400 dark:text-ink-500 line-through' : 'text-ink-900 dark:text-ink-50'
                                  }`}
                                >
                                  {item.ingredientName || 'Unknown Ingredient'}
                                </p>
                                <div className="flex gap-4 text-sm mt-1">
                                  <span className="text-ink-500 dark:text-ink-400">
                                    Need: {item.needed.amount} {item.needed.unit}
                                  </span>
                                  <span className="text-primary-600 dark:text-primary-400 font-medium">
                                    Buy: {item.afterPantry.amount} {item.afterPantry.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-2xl max-w-md w-full border border-surface-200 dark:border-ink-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50 mb-4">Generate Grocery List</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                    Select Planner Week
                  </label>
                  <select
                    id="planWeekSelect"
                    className="w-full px-3 py-2 border border-surface-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="">Select a week</option>
                    {plannerWeeks?.data?.map((week: any) => (
                      <option key={week.id} value={week.id}>
                        Week of {new Date(week.startDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                    Number of Trips
                  </label>
                  <select
                    id="tripsSelect"
                    className="w-full px-3 py-2 border border-surface-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                    defaultValue="2"
                  >
                    <option value="1">1 trip (whole week)</option>
                    <option value="2">2 trips (Sun-Wed, Thu-Sat)</option>
                    <option value="3">3 trips</option>
                    <option value="4">4 trips</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-surface-300 dark:border-ink-600 rounded-lg hover:bg-surface-100 dark:hover:bg-ink-700 text-ink-900 dark:text-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const planWeekId = (
                      document.getElementById('planWeekSelect') as HTMLSelectElement
                    )?.value
                    const trips = parseInt(
                      (document.getElementById('tripsSelect') as HTMLSelectElement)?.value || '2'
                    )
                    if (planWeekId) {
                      handleGenerateList(planWeekId, trips)
                    }
                  }}
                  disabled={computeMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {computeMutation.isPending ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroceryPage
