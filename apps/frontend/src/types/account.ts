/**
 * Account Management Types
 * 
 * Type definitions for account-related API requests and responses
 */

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  householdId?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  themePreference?: 'light' | 'dark' | 'system';
  lastLoginAt?: string;
}

export interface ProfileUpdateRequest {
  displayName: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PreferencesUpdateRequest {
  themePreference: 'light' | 'dark' | 'system';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
