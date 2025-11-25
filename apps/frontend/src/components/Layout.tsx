/**
 * Layout Component
 * 
 * Main application layout wrapper that provides:
 * - Collapsible sidebar navigation (desktop) / Hamburger menu (mobile)
 * - Top header with user menu and theme toggle
 * - Content area where child routes are rendered
 * - Responsive design for mobile, tablet, and desktop
 * 
 * This component wraps all protected routes in the application.
 */

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/lib/utils'

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('mealmap-sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  // Handle window resize to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // Close mobile menu when switching to desktop
      if (!mobile) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('mealmap-sidebar-collapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Responsive */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggleCollapse={toggleSidebarCollapse}
        onToggleMobile={toggleMobileMenu}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMobileMenuToggle={toggleMobileMenu} isMobile={isMobile} />

        {/* Page Content */}
        <main 
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8",
            "overflow-auto"
          )}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer - University Project Notice */}
        <footer className="border-t border-border bg-card px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-muted-foreground text-center">
              MealMap is a university project created for Fontys S3 Individual Project by Laszlo Kornis.
              {' '}
              <a 
                href="/terms" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
              >
                Terms of Use
              </a>
              {' · '}
              <a 
                href="/privacy" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
              >
                Privacy Policy
              </a>
              {' · '}
              <a 
                href="mailto:l.kornis@student.fontys.nl" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
              >
                Contact
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
