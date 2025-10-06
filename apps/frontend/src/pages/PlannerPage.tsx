const PlannerPage = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealSlots = ['Breakfast', 'Snack AM', 'Lunch', 'Snack PM', 'Dinner']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Planner</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Previous Week
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Next Week
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-white p-4 font-semibold">Meal</div>
          {days.map((day) => (
            <div key={day} className="bg-white p-4 font-semibold text-center">
              {day}
            </div>
          ))}

          {mealSlots.map((slot) => (
            <>
              <div key={`slot-${slot}`} className="bg-white p-4 font-medium text-gray-700">
                {slot}
              </div>
              {days.map((day) => (
                <div
                  key={`${day}-${slot}`}
                  className="bg-white p-4 min-h-[100px] hover:bg-gray-50 cursor-pointer"
                >
                  {/* Placeholder for meal items */}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlannerPage
