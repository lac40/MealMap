interface Config {
  apiBaseUrl: string
  appName: string
  environment: 'development' | 'staging' | 'production'
}

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1',
  appName: 'MealMap',
  environment:
    (import.meta.env.MODE as Config['environment']) || 'development',
}

export default config
