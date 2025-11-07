/**
 * Layout Component
 * 
 * Main application layout wrapper that provides:
 * - Top navigation header with app branding and user info
 * - Sidebar navigation menu with all main app sections
 * - Content area where child routes are rendered
 * 
 * This component wraps all protected routes in the application.
 */

import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, Package, BookOpen, Calendar, ShoppingCart, LogOut } from 'lucide-react'

const Layout = () => {
  // Get current user data and logout function from auth store
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Top navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* App branding */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">MealMap</h1>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.displayName}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Navigation menu */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <NavLink to="/" icon={<Home size={20} />}>
              Dashboard
            </NavLink>
            <NavLink to="/ingredients" icon={<Package size={20} />}>
              Ingredients
            </NavLink>
            <NavLink to="/recipes" icon={<BookOpen size={20} />}>
              Recipes
            </NavLink>
            <NavLink to="/planner" icon={<Calendar size={20} />}>
              Planner
            </NavLink>
            <NavLink to="/pantry" icon={<Package size={20} />}>
              Pantry
            </NavLink>
            <NavLink to="/grocery" icon={<ShoppingCart size={20} />}>
              Grocery List
            </NavLink>
          </nav>
        </aside>

        {/* Main content area - Renders child routes via Outlet */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/**
 * NavLink Component
 * 
 * Reusable navigation link with icon support
 * 
 * @param to - Route path to navigate to
 * @param icon - Icon element to display before the text
 * @param children - Link text content
 */
const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

export default Layout
