/**
 * Sidebar Component - Collapsible Navigation Sidebar
 * 
 * Features:
 * - Collapsible on desktop (shows icons only when collapsed)
 * - Auto-collapses to hamburger menu on mobile
 * - Smooth animations with framer-motion
 * - Active route highlighting
 * - Accessible keyboard navigation
 */

import { NavLink as RouterNavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Package, 
  BookOpen, 
  Calendar, 
  ShoppingCart,
  Menu,
  X,
  ChefHat
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  isMobileOpen: boolean
  onToggleCollapse: () => void
  onToggleMobile: () => void
  isMobile: boolean
}

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Ingredients', to: '/ingredients', icon: Package },
  { name: 'Recipes', to: '/recipes', icon: BookOpen },
  { name: 'Planner', to: '/planner', icon: Calendar },
  { name: 'Pantry', to: '/pantry', icon: ChefHat },
  { name: 'Grocery List', to: '/grocery', icon: ShoppingCart },
]

const Sidebar = ({ 
  isCollapsed, 
  isMobileOpen, 
  onToggleCollapse, 
  onToggleMobile,
  isMobile 
}: SidebarProps) => {
  // Mobile sidebar (overlay)
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleMobile}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary-600 dark:text-primary-500" />
                  <span className="text-lg font-semibold text-foreground">MealMap</span>
                </div>
                <button
                  onClick={onToggleMobile}
                  className="p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    isCollapsed={false}
                    onClick={onToggleMobile}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="hidden lg:flex flex-col bg-card border-r border-border h-screen sticky top-0"
    >
      {/* Desktop Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-header">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <ChefHat className="h-6 w-6 text-primary-600 dark:text-primary-500" />
              <span className="text-lg font-semibold text-foreground">MealMap</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChefHat className="h-6 w-6 text-primary-600 dark:text-primary-500 mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggleCollapse}
          className={cn(
            "p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            isCollapsed={isCollapsed}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}

/**
 * NavLink Component - Individual navigation link with active state
 */
interface NavLinkProps {
  to: string
  icon: React.ElementType
  children: React.ReactNode
  isCollapsed: boolean
  onClick?: () => void
}

const NavLink = ({ to, icon: Icon, children, isCollapsed, onClick }: NavLinkProps) => {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
          'hover:bg-primary-50 dark:hover:bg-primary-900/20',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-surface-900',
          'group relative',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
            : 'text-muted-foreground hover:text-foreground',
          isCollapsed && 'justify-center'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-5 w-5 flex-shrink-0 transition-colors',
              isActive ? 'text-primary-600 dark:text-primary-500' : ''
            )}
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                {children}
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {children}
            </div>
          )}
        </>
      )}
    </RouterNavLink>
  )
}

export default Sidebar
