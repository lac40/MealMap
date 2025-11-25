/**
 * Header Component - Top Navigation Bar
 * 
 * Features:
 * - MealMap branding
 * - Mobile hamburger menu toggle
 * - User profile dropdown with account access
 * - Dark mode toggle
 * - Logout functionality
 */

import { Menu, Sun, Moon, User, Settings, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMobileMenuToggle: () => void
  isMobile: boolean
}

const Header = ({ onMobileMenuToggle, isMobile }: HeaderProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useThemeStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAccountClick = () => {
    navigate('/account')
  }

  return (
    <header className="sticky top-0 z-30 h-header bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
        )}

        {/* Center: Empty spacer for mobile, maintains layout */}
        <div className="flex-1 lg:flex-none" />

        {/* Right: User Menu & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
            aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {resolvedTheme === 'light' ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* User Dropdown Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-700 dark:text-primary-400" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {user?.displayName || 'User'}
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={cn(
                  "min-w-[200px] bg-card border border-border rounded-lg shadow-elevated p-1",
                  "animate-slide-up origin-top-right z-50"
                )}
                align="end"
                sideOffset={8}
              >
                {/* User Info */}
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Account Settings */}
                <DropdownMenu.Item
                  onClick={handleAccountClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                    "text-foreground hover:bg-muted focus:bg-muted outline-none transition-colors"
                  )}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Account Settings</span>
                </DropdownMenu.Item>

                {/* Logout */}
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                    "text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20",
                    "focus:bg-danger-50 dark:focus:bg-danger-900/20 outline-none transition-colors"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}

export default Header
