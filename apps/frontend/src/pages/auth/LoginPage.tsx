import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { login as loginService } from '@/services/auth.service'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { getErrorMessage } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import config from '@/config'

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      login(data.user, data.accessToken)
      navigate('/')
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  const onSubmit = (data: LoginFormData) => {
    setServerError(null)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{config.appName}</h1>
          <p className="mt-2 text-foreground">Plan meals, shop smart</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Server Error */}
              {serverError && (
                <div
                  className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-600">{serverError}</p>
                </div>
              )}

              {/* Email Field */}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                disabled={loginMutation.isPending}
                {...register('email')}
                autoComplete="email"
                tabIndex={0}
              />

              {/* Password Field */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  disabled={loginMutation.isPending}
                  {...register('password')}
                  autoComplete="current-password"
                  tabIndex={0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loginMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-secondary-600 hover:text-secondary-700 dark:text-secondary-500 dark:hover:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
                  tabIndex={0}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
                tabIndex={0}
              >
                Sign In
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-secondary-600 hover:text-secondary-700 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-foreground">
          By signing in, you agree to our{' '}
          <a
            href="/terms"
            className="text-secondary-600 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
