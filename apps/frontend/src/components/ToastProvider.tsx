/**
 * Toast Provider - Global Toast Notification System
 * 
 * Wrapper for Sonner toast library with theme support
 * Provides toast notifications throughout the application
 */

import { Toaster } from 'sonner'
import { useThemeStore } from '@/store/themeStore'

const ToastProvider = () => {
  const { resolvedTheme } = useThemeStore()

  return (
    <Toaster
      theme={resolvedTheme}
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'bg-card border-border',
          title: 'text-foreground',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary-600 text-white',
          cancelButton: 'bg-muted text-muted-foreground',
          closeButton: 'bg-muted text-muted-foreground hover:bg-border',
        },
      }}
    />
  )
}

export default ToastProvider
