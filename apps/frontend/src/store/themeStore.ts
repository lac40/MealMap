/**
 * Theme Store - Manages dark mode preferences
 * 
 * Handles theme switching and persistence using localStorage.
 * Automatically applies theme on mount and syncs with system preferences.
 */

import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/**
 * Gets the system's preferred color scheme
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves the actual theme to apply based on the theme setting
 */
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

/**
 * Applies the theme to the document element
 */
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

// Load theme from localStorage
const loadTheme = (): Theme => {
  const stored = localStorage.getItem('mealmap-theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

// Save theme to localStorage
const saveTheme = (theme: Theme) => {
  localStorage.setItem('mealmap-theme', theme)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: loadTheme(),
  resolvedTheme: getSystemTheme(),
  
  setTheme: (theme: Theme) => {
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
    saveTheme(theme)
    set({ theme, resolvedTheme: resolved })
  },
  
  toggleTheme: () => {
    const current = get().resolvedTheme
    const newTheme = current === 'light' ? 'dark' : 'light'
    applyTheme(newTheme)
    saveTheme(newTheme)
    set({ theme: newTheme, resolvedTheme: newTheme })
  },
}))

// Listen for system theme changes when theme is set to 'system'
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState()
    if (store.theme === 'system') {
      const newTheme = e.matches ? 'dark' : 'light'
      applyTheme(newTheme)
      useThemeStore.setState({ resolvedTheme: newTheme })
    }
  })
}

// Initialize theme on first load
const initialTheme = useThemeStore.getState().theme
const resolved = resolveTheme(initialTheme)
applyTheme(resolved)
useThemeStore.setState({ resolvedTheme: resolved })
