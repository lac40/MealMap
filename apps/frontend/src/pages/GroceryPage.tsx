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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart size={32} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            Generate from Planner
          </button>
          {groceryList && (
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={20} />
              Export
            </button>
          )}
        </div>
      </div>

      {!groceryList && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Grocery List Yet</h2>
            <p className="text-gray-500 mb-6">
              Generate a grocery list from your weekly planner to get started.
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Generate from Planner
            </button>
          </div>
        </div>
      )}

      {groceryList && (
        <div className="space-y-6">
          {groceryList.trips.map((trip, tripIndex) => (
            <div key={tripIndex} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Trip {trip.tripIndex + 1}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <p className="text-center text-gray-500 py-4">No items for this trip</p>
                ) : (
                  Object.entries(groupItemsByCategory(trip.items)).map(([category, items]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
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
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                item.checked
                                  ? 'bg-gray-50 border-gray-200'
                                  : 'bg-white border-gray-300 hover:border-primary-300'
                              }`}
                            >
                              <button
                                onClick={() => toggleItemChecked(tripIndex, originalIndex)}
                                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                                  item.checked
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'border-gray-300 hover:border-primary-500'
                                }`}
                              >
                                {item.checked && <Check size={16} className="text-white" />}
                              </button>
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    item.checked ? 'text-gray-400 line-through' : 'text-gray-900'
                                  }`}
                                >
                                  {item.ingredientName || 'Unknown Ingredient'}
                                </p>
                                <div className="flex gap-4 text-sm mt-1">
                                  <span className="text-gray-500">
                                    Need: {item.needed.amount} {item.needed.unit}
                                  </span>
                                  <span className="text-primary-600 font-medium">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Grocery List</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Planner Week
                  </label>
                  <select
                    id="planWeekSelect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Trips
                  </label>
                  <select
                    id="tripsSelect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
