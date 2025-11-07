/**
 * Application Configuration
 * 
 * Centralized configuration management using environment variables.
 * Values are loaded from Vite's import.meta.env with fallback defaults.
 * 
 * Environment Variables (defined in .env files):
 * - VITE_API_BASE_URL: Backend API endpoint
 * - MODE: Build mode (development/staging/production)
 */

interface Config {
  apiBaseUrl: string                                         // Backend API base URL
  appName: string                                            // Application name
  environment: 'development' | 'staging' | 'production'      // Current environment
}

/**
 * Application configuration object
 * 
 * Reads from environment variables with sensible defaults for development
 */
const config: Config = {
  // API endpoint - defaults to local development server
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1',
  
  // Application name
  appName: 'MealMap',
  
  // Environment mode from Vite
  environment:
    (import.meta.env.MODE as Config['environment']) || 'development',
}

export default config
