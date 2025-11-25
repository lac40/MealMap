import api from '../lib/api';
import type {
  ProfileUpdateRequest,
  PasswordChangeRequest,
  PreferencesUpdateRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserDto
} from '../types/account.ts';

/**
 * Account Service
 * 
 * Handles all account-related API calls:
 * - Profile management
 * - Password changes
 * - Password reset flow
 * - Account deletion
 * - Preferences
 */

export const accountService = {
  /**
   * Get current user account details
   */
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get<UserDto>('/api/account');
    return response.data;
  },

  /**
   * Update user profile (display name and email)
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<UserDto> => {
    const response = await api.put<UserDto>('/api/account/profile', data);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await api.put('/api/account/password', data);
  },

  /**
   * Update user preferences (theme, etc.)
   */
  updatePreferences: async (data: PreferencesUpdateRequest): Promise<void> => {
    await api.put('/api/account/preferences', data);
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<void> => {
    await api.delete('/api/account');
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/api/account/forgot-password', data);
  },

  /**
   * Reset password using token from email
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/api/account/reset-password', data);
  }
};
