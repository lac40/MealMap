-- V6: Add user account management fields
-- Adds fields for terms acceptance, password reset functionality, and user preferences

-- Add terms acceptance timestamp
ALTER TABLE users ADD terms_accepted_at DATETIME2 NULL;

-- Add password reset fields
ALTER TABLE users ADD password_reset_token NVARCHAR(255) NULL;
ALTER TABLE users ADD password_reset_expiry DATETIME2 NULL;

-- Add theme preference field
ALTER TABLE users ADD theme_preference NVARCHAR(10) NOT NULL DEFAULT 'system';

-- Add last login tracking
ALTER TABLE users ADD last_login_at DATETIME2 NULL;

-- Create index on password reset token for faster lookups (simple non-filtered index)
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

-- Create index on password reset expiry for cleanup queries (simple non-filtered index)
CREATE INDEX idx_users_password_reset_expiry ON users(password_reset_expiry);
