/**
 * App Component - Main Application Router
 * 
 * Handles routing and authentication-based navigation for the entire application.
 * Implements route protection to ensure only authenticated users can access
 * protected pages.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import ToastProvider from './components/ToastProvider'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import IngredientsPage from './pages/IngredientsPage'
import RecipesPage from './pages/RecipesPage'
import PlannerPage from './pages/PlannerPage'
import PantryPage from './pages/PantryPage'
import GroceryPage from './pages/GroceryPage'
import AccountPage from './pages/AccountPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'

function App() {
  // Get authentication status from the global auth store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <>
      <ToastProvider />
      <Routes>
      {/* 
        Public Routes - Authentication Pages
        Redirect to dashboard if user is already logged in
      */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />} />
      
      {/* 
        Legal Pages - Accessible to everyone
      */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* 
        Protected Routes - Main Application Features
        All routes use the Layout component wrapper which provides navigation and header
        Redirect to login if user is not authenticated
      */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/pantry" element={<PantryPage />} />
        <Route path="/grocery" element={<GroceryPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      {/* 
        Fallback Route
        Redirects any unknown paths to the home page
      */}
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
