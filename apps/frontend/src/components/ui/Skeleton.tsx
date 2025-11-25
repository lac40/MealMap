/**
 * Skeleton Components - Loading Placeholders
 * 
 * Provides skeleton screens for various content types while data is loading.
 * Improves perceived performance and UX with shimmer animations.
 */

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Base Skeleton Component
 */
export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'skeleton rounded-lg bg-muted',
        className
      )}
      role="status"
      aria-label="Loading..."
    />
  )
}

/**
 * Card Skeleton - For card-based content
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-card rounded-card border border-border p-6 shadow-card">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  )
}

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Table Skeleton - Complete table with multiple rows
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => {
  return (
    <div className="border border-border rounded-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted border-b border-border">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * List Skeleton - Multiple list items
 */
export const ListSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="bg-card rounded-card border border-border overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Form Skeleton
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 mt-6" />
    </div>
  )
}

/**
 * Page Header Skeleton
 */
export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
  )
}

/**
 * Dashboard Stats Skeleton
 */
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-card rounded-card border border-border p-6 shadow-card">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  )
}
