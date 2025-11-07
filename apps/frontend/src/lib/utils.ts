/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 * Includes class name merging, date formatting, and performance utilities.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS conflict resolution
 * 
 * Combines multiple class names and intelligently resolves Tailwind conflicts.
 * For example, if you pass both "p-4" and "p-2", only "p-2" (the last one) applies.
 * 
 * @param inputs - Class names to merge (strings, arrays, objects, etc.)
 * @returns Merged class name string
 * 
 * @example
 * cn('px-2 py-1', 'px-3') // Returns: 'py-1 px-3'
 * cn('text-red-500', isActive && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to human-readable string
 * 
 * Converts Date object or ISO string to localized date format
 * 
 * @param date - Date object or ISO date string
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get start of ISO week (Monday) for a given date
 * 
 * ISO weeks start on Monday, unlike JavaScript's getDay() which uses Sunday.
 * Used for meal planner week navigation.
 * 
 * @param date - Date to find week start for
 * @returns Date object for Monday of that week
 */
export function getISOWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Calculate difference to Monday (1 = Monday, 0 = Sunday)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * Get formatted week range string
 * 
 * Creates a readable week range from Monday to Sunday
 * 
 * @param startDate - Monday of the week
 * @returns Formatted range string (e.g., "Jan 15 - Jan 21, 2024")
 */
export function getWeekRangeString(startDate: Date): string {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${start} - ${end}`
}

/**
 * Debounce function
 * 
 * Delays function execution until after specified wait time has elapsed
 * since the last call. Useful for search inputs to reduce API calls.
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait before executing
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => searchAPI(query), 300)
 * // User types "recipe" → Only calls API once after they stop typing for 300ms
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    // Clear existing timeout and set new one
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
