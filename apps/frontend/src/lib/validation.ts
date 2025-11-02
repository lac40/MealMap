import { z } from 'zod'

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  mfaCode: z
    .string()
    .length(6, 'MFA code must be 6 digits')
    .regex(/^\d+$/, 'MFA code must contain only numbers')
    .optional()
    .or(z.literal('')),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register form validation schema
 */
export const registerSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
})

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

/**
 * Ingredient form validation schema
 */
export const ingredientSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .max(100, 'Ingredient name must be less than 100 characters'),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .uuid('Invalid category'),
  defaultUnit: z.enum(['g', 'kg', 'ml', 'l', 'piece', 'pack'], {
    errorMap: () => ({ message: 'Please select a unit' }),
  }),
  packageAmount: z
    .number({ invalid_type_error: 'Package amount must be a number' })
    .or(z.string().transform((val) => Number(val)))
    .pipe(z.number().positive('Package amount must be greater than 0').max(100000, 'Package amount is too large')),
  packageUnit: z.enum(['g', 'kg', 'ml', 'l', 'piece', 'pack'], {
    errorMap: () => ({ message: 'Please select a package unit' }),
  }),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
})

export type IngredientFormData = z.infer<typeof ingredientSchema>

// Recipe validation
export const recipeItemSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.object({
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .or(z.string().transform((val) => Number(val)))
      .pipe(
        z
          .number()
          .positive('Amount must be greater than 0')
          .max(100000, 'Amount is too large')
      ),
    unit: z.enum(['g', 'kg', 'ml', 'l', 'piece', 'pack'], {
      errorMap: () => ({ message: 'Please select a unit' }),
    }),
  }),
  packageNote: z.string().max(100, 'Note is too long').optional(),
})

export const recipeSchema = z.object({
  name: z
    .string()
    .min(1, 'Recipe name is required')
    .max(200, 'Recipe name is too long'),
  externalUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  items: z
    .array(recipeItemSchema)
    .min(1, 'Recipe must have at least one ingredient')
    .max(150, 'Too many ingredients'),
})

export type RecipeFormData = z.infer<typeof recipeSchema>
