/**
 * Button Component
 * 
 * Reusable button component with multiple variants, sizes, and states.
 * Built with accessibility in mind and supports loading states.
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, ghost, danger)
 * - Size options (sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Full TypeScript support
 * - Accessible (ARIA, keyboard navigation, focus states)
 * 
 * Usage:
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * <Button isLoading leftIcon={<Plus />}>
 *   Save
 * </Button>
 * ```
 */

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'  // Visual style variant
  size?: 'sm' | 'md' | 'lg'                               // Button size
  isLoading?: boolean                                     // Show loading spinner
  leftIcon?: React.ReactNode                              // Icon before text
  rightIcon?: React.ReactNode                             // Icon after text
}

/**
 * Button component with forward ref support
 * Allows parent components to access the underlying button element
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles applied to all buttons
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    // Variant-specific color and style mappings
    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700',
      secondary:
        'border-2 border-secondary-600 text-secondary-600 hover:bg-secondary-50 active:bg-secondary-50',
      ghost:
        'text-ink-700 hover:bg-surface-100 active:bg-surface-100',
      danger:
        'bg-danger-600 text-white hover:bg-red-700 active:bg-red-700',
    }

    // Size-specific padding and height mappings
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}  // Disable during loading
        {...props}
      >
        {/* Show spinner when loading, otherwise show left icon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span aria-hidden="true">{leftIcon}</span>
        ) : null}
        
        {/* Button text content */}
        {children}
        
        {/* Right icon (only shown when not loading) */}
        {!isLoading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
