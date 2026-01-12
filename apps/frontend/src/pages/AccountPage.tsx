/**
 * Account Page
 * 
 * User account management with:
 * - Profile information (display name, email)
 * - Password change
 * - Theme preferences (dark/light/system)
 * - Account deletion
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Lock, Trash2, Palette, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, type Theme } from '@/store/themeStore'
import { profileUpdateSchema, passwordChangeSchema, type ProfileUpdateFormData, type PasswordChangeFormData } from '@/lib/validation'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import * as Dialog from '@radix-ui/react-dialog'

const AccountPage = () => {
  const { user } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, security, and preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <ProfileSection user={user} />

      {/* Security Section */}
      <SecuritySection />

      {/* Preferences Section */}
      <PreferencesSection />

      {/* Danger Zone */}
      <DangerZoneSection 
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
      />
    </div>
  )
}

/**
 * Profile Information Section
 */
interface ProfileSectionProps {
  user: any
}

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateFormData) => {
      // TODO: Call actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-500" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Display Name"
            type="text"
            disabled={!isEditing || updateProfileMutation.isPending}
            error={errors.displayName?.message}
            {...register('displayName')}
            tabIndex={0}
          />

          <Input
            label="Email Address"
            type="email"
            disabled={!isEditing || updateProfileMutation.isPending}
            error={errors.email?.message}
            helperText="Changing your email will require verification"
            {...register('email')}
            tabIndex={0}
          />

          {isEditing && (
            <div className="flex gap-2">
              <Button
                type="submit"
                isLoading={updateProfileMutation.isPending}
                disabled={updateProfileMutation.isPending}
                tabIndex={0}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                tabIndex={0}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Security / Password Change Section
 */
const SecuritySection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      // TODO: Call actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      reset()
    },
    onError: () => {
      toast.error('Failed to change password. Check your current password.')
    },
  })

  const onSubmit = (data: PasswordChangeFormData) => {
    changePasswordMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary-600 dark:text-primary-500" />
          <CardTitle>Change Password</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            disabled={changePasswordMutation.isPending}
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
            autoComplete="current-password"
            tabIndex={0}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            disabled={changePasswordMutation.isPending}
            error={errors.newPassword?.message}
            helperText="At least 8 characters with uppercase, lowercase, and number"
            {...register('newPassword')}
            autoComplete="new-password"
            tabIndex={0}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            disabled={changePasswordMutation.isPending}
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
            autoComplete="new-password"
            tabIndex={0}
          />

          <Button
            type="submit"
            isLoading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
            tabIndex={0}
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Preferences Section
 */
const PreferencesSection = () => {
  const { theme, setTheme } = useThemeStore()

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary-600 dark:text-primary-500" />
          <CardTitle>Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption
              value="light"
              label="Light"
              isSelected={theme === 'light'}
              onClick={() => handleThemeChange('light')}
            />
            <ThemeOption
              value="dark"
              label="Dark"
              isSelected={theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            />
            <ThemeOption
              value="system"
              label="System"
              isSelected={theme === 'system'}
              onClick={() => handleThemeChange('system')}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Choose your preferred color scheme
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Theme Option Button
 */
interface ThemeOptionProps {
  value: Theme
  label: string
  isSelected: boolean
  onClick: () => void
}

const ThemeOption = ({ label, isSelected, onClick }: ThemeOptionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-3 rounded-lg border-2 transition-all',
        'hover:border-primary-600 dark:hover:border-primary-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
        isSelected
          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
          : 'border-border bg-card text-muted-foreground hover:text-foreground'
      )}
      tabIndex={0}
    >
      {label}
      {isSelected && (
        <CheckCircle className="h-4 w-4 ml-2 inline-block" />
      )}
    </button>
  )
}

/**
 * Danger Zone Section
 */
interface DangerZoneSectionProps {
  showDeleteDialog: boolean
  setShowDeleteDialog: (show: boolean) => void
}

const DangerZoneSection = ({ showDeleteDialog, setShowDeleteDialog }: DangerZoneSectionProps) => {
  const { logout } = useAuthStore()
  const [confirmText, setConfirmText] = useState('')

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // TODO: Call actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success('Account deleted successfully')
      setTimeout(() => {
        logout()
      }, 1000)
    },
    onError: () => {
      toast.error('Failed to delete account')
    },
  })

  const handleDelete = () => {
    if (confirmText === 'DELETE') {
      deleteAccountMutation.mutate()
    }
  }

  return (
    <Card className="border-danger-200 dark:border-danger-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-500" />
          <CardTitle className="text-danger-600 dark:text-danger-500">Danger Zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground mb-1">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-modal shadow-elevated p-6 w-full max-w-md z-50 animate-scale-in focus:outline-none">
              <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
                Delete Account
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mb-4">
                This action is permanent and cannot be undone. All your data including meal plans, 
                recipes, and lists will be permanently deleted.
              </Dialog.Description>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 rounded-button border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-danger-600"
                    placeholder="DELETE"
                    disabled={deleteAccountMutation.isPending}
                    tabIndex={0}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE' || deleteAccountMutation.isPending}
                    isLoading={deleteAccountMutation.isPending}
                    className="flex-1"
                    tabIndex={0}
                  >
                    Delete My Account
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setConfirmText('')
                    }}
                    disabled={deleteAccountMutation.isPending}
                    className="flex-1"
                    tabIndex={0}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  )
}

export default AccountPage
