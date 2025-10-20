import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-50 text-primary-700',
      secondary: 'bg-secondary-50 text-secondary-600',
      accent: 'bg-accent-50 text-orange-700',
      success: 'bg-green-50 text-green-700',
      warning: 'bg-yellow-50 text-yellow-700',
      danger: 'bg-red-50 text-red-700',
      info: 'bg-blue-50 text-blue-700',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Chip.displayName = 'Chip'

export default Chip
