/**
 * Authentication Store (Zustand)
 * 
 * Global state management for user authentication using Zustand.
 * Persists authentication data to localStorage for session persistence.
 * 
 * Features:
 * - User data storage
 * - JWT access token management
 * - Authentication state tracking
 * - Automatic persistence across page refreshes
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User data interface
 */
export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  createdAt: string
  householdId?: string
  mfaEnabled?: boolean
  emailVerified?: boolean
}

/**
 * Authentication state and actions
 */
interface AuthState {
  // State
  user: User | null                           // Current authenticated user
  accessToken: string | null                  // JWT access token for API requests
  isAuthenticated: boolean                    // Quick authentication check
  
  // Actions
  login: (user: User, accessToken: string) => void    // Store user and token on login
  logout: () => void                                   // Clear all auth data
  updateUser: (user: Partial<User>) => void           // Update user profile data
  setAccessToken: (token: string) => void             // Update access token (for refresh)
}

/**
 * Create the auth store with persistence
 * 
 * Uses Zustand's persist middleware to save state to localStorage
 * under the key 'auth-storage', ensuring users stay logged in
 * across page refreshes and browser sessions
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,

      /**
       * Login action
       * Stores user data and access token, marks user as authenticated
       */
      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      /**
       * Logout action
       * Clears all authentication data and marks user as unauthenticated
       */
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      /**
       * Update user action
       * Partially updates the user object (e.g., after profile edit)
       */
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      /**
       * Set access token action
       * Updates only the access token (used after token refresh)
       */
      setAccessToken: (token) =>
        set({
          accessToken: token,
        }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
