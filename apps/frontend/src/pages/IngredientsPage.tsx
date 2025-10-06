const IngredientsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Add Ingredient
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center text-gray-500">
          No ingredients yet. Click "Add Ingredient" to get started.
        </div>
      </div>
    </div>
  )
}

export default IngredientsPage
