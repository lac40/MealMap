/**
 * DashboardPage Component
 * 
 * Landing page for authenticated users showing overview statistics:
 * - Total ingredients available
 * - Total recipes in collection
 * - Planned meals count
 * - Pantry items count
 * - Upcoming meals
 * 
 * Uses React Query to fetch dashboard statistics from the API
 */

import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../services/dashboard.service'
import { Loader2 } from 'lucide-react'

const DashboardPage = () => {
  // Fetch dashboard statistics with React Query
  // Automatically handles loading, error states, and caching
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'], // Unique key for caching
    queryFn: getDashboardStats,     // Function to fetch data
  })

  // Loading state - Show spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Error state - Show error message if data fetch fails
  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Failed to load dashboard statistics
      </div>
    )
  }

  // Success state - Display dashboard statistics in cards
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Ingredients" 
          count={stats?.ingredientsCount ?? 0} 
          color="blue"
          subtitle="Available in your pantry" 
        />
        <DashboardCard 
          title="Recipes" 
          count={stats?.recipesCount ?? 0} 
          color="green"
          subtitle="In your collection" 
        />
        <DashboardCard 
          title="Planned Meals" 
          count={stats?.plannedMealsCount ?? 0} 
          color="purple"
          subtitle="This week" 
        />
        <DashboardCard 
          title="Pantry Items" 
          count={stats?.pantryItemsCount ?? 0} 
          color="orange"
          subtitle="Total stored items" 
        />
        <DashboardCard 
          title="Upcoming Meals" 
          count={stats?.upcomingMealsCount ?? 0} 
          color="indigo"
          subtitle="Next 7 days" 
        />
      </div>
    </div>
  )
}

/**
 * DashboardCard Component
 * 
 * Displays a single statistic with color-coded styling
 * 
 * @param title - Card title (e.g., "Ingredients")
 * @param count - Numeric value to display
 * @param color - Color theme for the count display
 * @param subtitle - Optional description text below the count
 */
const DashboardCard = ({ 
  title, 
  count, 
  color,
  subtitle 
}: { 
  title: string
  count: number
  color: string
  subtitle?: string
}) => {
  // Map color names to Tailwind CSS classes
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className={`text-4xl font-bold mb-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {count}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}

export default DashboardPage
