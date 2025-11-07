/**
 * Input Component
 * 
 * Reusable form input component with built-in label, error, and helper text support.
 * Fully accessible with ARIA attributes and keyboard navigation.
 * 
 * Features:
 * - Optional label with required indicator
 * - Error message display with ARIA alerts
 * - Helper text for additional guidance
 * - Disabled state styling
 * - Focus states with ring animation
 * - Auto-generated IDs for accessibility
 * 
 * Usage:
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   required
 *   error={errors.email?.message}
 *   helperText="We'll never share your email"
 *   {...register('email')}
 * />
 * ```
 */

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string          // Optional label text above input
  error?: string          // Error message to display below input
  helperText?: string     // Helper text shown below input (hidden if error exists)
}

/**
 * Input component with forward ref support
 * ForwardRef allows React Hook Form to register the input
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for accessibility if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    // IDs for ARIA relationships
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

    return (
      <div className="w-full">
        {/* Label - Only rendered if label prop provided */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-ink-700 mb-1',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {/* Required indicator (*) with accessible label */}
            {required && <span className="text-danger-600 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        {/* Input field */}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}  // Accessibility: mark invalid
          aria-describedby={cn(errorId, helperId).trim() || undefined}  // Link to error/helper
          className={cn(
            // Base styles
            'flex h-11 w-full rounded-button border border-divider-200 bg-white px-3 py-2 text-base',
            'placeholder:text-gray-400',
            // Focus styles - blue ring on focus
            'focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:ring-offset-0 focus:border-transparent',
            // Disabled styles
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50',
            'transition-colors',
            // Error styles - red border and ring
            error &&
              'border-danger-600 focus:ring-danger-600',
            className
          )}
          {...props}
        />
        
        {/* Error message - shown below input with red text */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-danger-600"
            role="alert"  // Accessibility: announce errors to screen readers
          >
            {error}
          </p>
        )}
        
        {/* Helper text - only shown if no error */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1 text-sm text-ink-700"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
