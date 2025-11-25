import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../services/dashboard.service'
import { 
  Package, 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CardSkeleton } from '../components/ui/Skeleton'

const DashboardPage = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-200 dark:bg-ink-700 rounded animate-pulse" />
          <div className="h-5 w-96 bg-surface-200 dark:bg-ink-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
            Failed to Load Dashboard
          </h3>
          <p className="text-ink-600 dark:text-ink-400">
            Unable to fetch dashboard statistics. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Ingredients',
      count: stats?.ingredientsCount ?? 0,
      subtitle: 'Available in your library',
      icon: Package,
      gradient: 'from-primary-500 to-primary-600',
      link: '/ingredients',
    },
    {
      title: 'Recipes',
      count: stats?.recipesCount ?? 0,
      subtitle: 'In your collection',
      icon: ChefHat,
      gradient: 'from-accent-500 to-accent-600',
      link: '/recipes',
    },
    {
      title: 'Planned Meals',
      count: stats?.plannedMealsCount ?? 0,
      subtitle: 'This week',
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      link: '/planner',
    },
    {
      title: 'Pantry Items',
      count: stats?.pantryItemsCount ?? 0,
      subtitle: 'Total stored items',
      icon: Package,
      gradient: 'from-orange-500 to-orange-600',
      link: '/pantry',
    },
    {
      title: 'Upcoming Meals',
      count: stats?.upcomingMealsCount ?? 0,
      subtitle: 'Next 7 days',
      icon: Clock,
      gradient: 'from-indigo-500 to-indigo-600',
      link: '/planner',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50">
          Dashboard
        </h1>
        <p className="text-ink-600 dark:text-ink-400">
          Overview of your meal planning activities
        </p>
      </motion.div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <DashboardCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-ink-800 dark:to-ink-700 rounded-2xl p-6 border border-surface-200 dark:border-ink-600"
      >
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton to="/ingredients" icon={Package} label="Add Ingredient" />
          <QuickActionButton to="/recipes" icon={ChefHat} label="Create Recipe" />
          <QuickActionButton to="/planner" icon={Calendar} label="Plan Meal" />
          <QuickActionButton to="/grocery" icon={ShoppingCart} label="Shopping List" />
        </div>
      </motion.div>
    </div>
  )
}

const DashboardCard = ({ 
  title, 
  count, 
  subtitle,
  icon: Icon,
  gradient,
  link
}: { 
  title: string
  count: number
  subtitle: string
  icon: any
  gradient: string
  link: string
}) => {
  return (
    <Link to={link}>
      <div className="group bg-surface-50 dark:bg-ink-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-surface-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-surface-50" />
          </div>
          <ArrowRight className="w-5 h-5 text-ink-400 dark:text-ink-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        <h3 className="text-sm font-medium text-ink-600 dark:text-ink-400 mb-2">
          {title}
        </h3>
        
        <p className="text-4xl font-bold text-ink-900 dark:text-ink-50 mb-2">
          {count}
        </p>
        
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {subtitle}
        </p>
      </div>
    </Link>
  )
}

const QuickActionButton = ({ 
  to, 
  icon: Icon, 
  label 
}: { 
  to: string
  icon: any
  label: string
}) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 bg-surface-50 dark:bg-ink-900 rounded-xl border border-surface-200 dark:border-ink-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-ink-700 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <span className="font-medium text-ink-900 dark:text-ink-50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
        {label}
      </span>
    </Link>
  )
}

export default DashboardPage
