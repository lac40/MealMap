import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { register as registerService } from '@/services/auth.service'
import { registerSchema, type RegisterFormData } from '@/lib/validation'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import config from '@/config'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: registerService,
    onSuccess: () => {
      setRegistrationSuccess(true)
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null)
    // Remove fields not needed by backend
    const { confirmPassword, acceptTerms, ...registerData } = data
    registerMutation.mutate(registerData)
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Registration Successful!
              </h2>
              <p className="text-foreground mb-6">
                We've sent a verification email to your address. Please check your inbox
                and verify your email to complete the registration.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{config.appName}</h1>
          <p className="mt-2 text-foreground">Start planning your meals today</p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
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

              {/* Display Name Field */}
              <Input
                label="Display Name"
                type="text"
                placeholder="John Doe"
                error={errors.displayName?.message}
                disabled={registerMutation.isPending}
                {...register('displayName')}
                autoComplete="name"
                tabIndex={0}
              />

              {/* Email Field */}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                disabled={registerMutation.isPending}
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
                  helperText="At least 8 characters with uppercase, lowercase, and number"
                  disabled={registerMutation.isPending}
                  {...register('password')}
                  autoComplete="new-password"
                  tabIndex={0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={registerMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  disabled={registerMutation.isPending}
                  {...register('confirmPassword')}
                  autoComplete="new-password"
                  tabIndex={0}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={registerMutation.isPending}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Terms Acceptance Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className={cn(
                      'mt-1 h-4 w-4 rounded border-divider-200 text-primary-600',
                      'focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'transition-colors cursor-pointer',
                      errors.acceptTerms && 'border-danger-600'
                    )}
                    disabled={registerMutation.isPending}
                    {...register('acceptTerms')}
                    tabIndex={0}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className={cn(
                      'text-sm text-muted-foreground cursor-pointer',
                      errors.acceptTerms && 'text-danger-600'
                    )}
                  >
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 underline font-medium"
                      tabIndex={0}
                    >
                      Terms of Use
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 underline font-medium"
                      tabIndex={0}
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-danger-600" role="alert">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                isLoading={registerMutation.isPending}
                disabled={registerMutation.isPending}
                tabIndex={0}
              >
                Create Account
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-secondary-600 hover:text-secondary-700 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-foreground">
          By creating an account, you agree to our{' '}
          <a
            href="/terms"
            className="text-secondary-600 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            className="text-secondary-600 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600 rounded"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
