/**
 * Design tokens for MealMap application
 * Following WCAG 2.1 AA contrast requirements
 */

export const colors = {
  // Ink (text/primary content)
  'ink-900': '#0F172A',
  'ink-700': '#334155',

  // Surface (backgrounds)
  'surface-50': '#F8FAFC',
  'surface-100': '#F1F5F9',

  // Divider
  'divider-200': '#E2E8F0',

  // Primary (green theme)
  'primary-50': '#ECFDF5',
  'primary-600': '#16A34A',
  'primary-700': '#15803D',

  // Accent (orange)
  'accent-50': '#FFF7ED',
  'accent-600': '#EA580C',

  // Secondary (blue)
  'secondary-50': '#EFF6FF',
  'secondary-600': '#2563EB',

  // Status colors
  'success-600': '#16A34A',
  'warning-600': '#D97706',
  'danger-600': '#DC2626',
  'info-600': '#2563EB',

  // Base
  white: '#FFFFFF',
} as const

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  12: '3rem', // 48px
  16: '4rem', // 64px
} as const

export const radius = {
  sm: '0.5rem', // 8px (inputs/buttons)
  md: '0.75rem', // 12px (cards)
  lg: '1rem', // 16px (modals)
  full: '9999px', // circular
} as const

export const shadows = {
  card: '0 2px 8px rgba(2, 6, 23, 0.08)',
  elevated: '0 8px 24px rgba(2, 6, 23, 0.18)',
  focus: '0 0 0 2px var(--color-secondary-600)',
} as const

export const typography = {
  display: {
    fontSize: '1.75rem', // 28px
    lineHeight: '2.25rem', // 36px
    fontWeight: '600',
  },
  h1: {
    fontSize: '1.75rem', // 28px
    lineHeight: '2.25rem', // 36px
    fontWeight: '600',
  },
  h2: {
    fontSize: '1.375rem', // 22px
    lineHeight: '1.75rem', // 28px
    fontWeight: '600',
  },
  h3: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.5rem', // 24px
    fontWeight: '500',
  },
  body: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
    fontWeight: '400',
  },
  small: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '400',
  },
} as const

export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1280px',
} as const

export const sizes = {
  headerHeight: '64px',
  navWidthCollapsed: '80px',
  navWidthExpanded: '240px',
  rightPaneWidth: '320px',
  maxContentWidth: '1280px',
  inputHeight: {
    sm: '32px',
    md: '44px',
    lg: '48px',
  },
} as const

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type RadiusToken = keyof typeof radius
