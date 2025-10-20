const RecipesPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Add Recipe
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center text-gray-500">
          No recipes yet. Click "Add Recipe" to get started.
        </div>
      </div>
    </div>
  )
}

export default RecipesPage
