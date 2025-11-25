-- V6: Add user account management fields
-- Adds fields for terms acceptance, password reset functionality, and user preferences

-- Add terms acceptance timestamp
ALTER TABLE users ADD COLUMN terms_accepted_at DATETIME2 NULL;

-- Add password reset fields
ALTER TABLE users ADD COLUMN password_reset_token NVARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN password_reset_expiry DATETIME2 NULL;

-- Add theme preference field
ALTER TABLE users ADD COLUMN theme_preference NVARCHAR(10) NOT NULL DEFAULT 'system';

-- Add last login tracking
ALTER TABLE users ADD COLUMN last_login_at DATETIME2 NULL;

-- Create index on password reset token for faster lookups
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- Create index on password reset expiry for cleanup queries
CREATE INDEX idx_users_password_reset_expiry ON users(password_reset_expiry) WHERE password_reset_expiry IS NOT NULL;
