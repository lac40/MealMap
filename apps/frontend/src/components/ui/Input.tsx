import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

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
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-ink-700 mb-1',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-danger-600 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(errorId, helperId).trim() || undefined}
          className={cn(
            'flex h-11 w-full rounded-button border border-divider-200 bg-white px-3 py-2 text-base',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:ring-offset-0 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50',
            'transition-colors',
            error &&
              'border-danger-600 focus:ring-danger-600',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-danger-600"
            role="alert"
          >
            {error}
          </p>
        )}
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
