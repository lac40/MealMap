/**
 * Application Entry Point
 * 
 * This file initializes the React application and sets up the core providers:
 * - React Query for server state management and data fetching
 * - React Router for client-side routing
 * - Strict Mode for highlighting potential issues in development
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/**
 * React Query Client Configuration
 * 
 * Manages server state and caching for API requests:
 * - refetchOnWindowFocus: false - Prevents automatic refetch when window regains focus
 * - retry: 1 - Only retry failed requests once before showing an error
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

/**
 * Render the React application
 * 
 * Provider hierarchy:
 * 1. React.StrictMode - Development mode checks and warnings
 * 2. QueryClientProvider - Makes React Query available throughout the app
 * 3. BrowserRouter - Enables client-side routing with HTML5 history API
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
