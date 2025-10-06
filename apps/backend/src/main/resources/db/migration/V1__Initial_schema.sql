-- V1__Initial_schema.sql
-- MS SQL Server syntax

-- Users table
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    display_name NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500) NULL,
    mfa_enabled BIT NOT NULL DEFAULT 0,
    email_verified BIT NOT NULL DEFAULT 0,
    household_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Households table
CREATE TABLE households (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    admin_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Add foreign key
ALTER TABLE users ADD CONSTRAINT fk_user_household 
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;

-- Profiles table
CREATE TABLE profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    role NVARCHAR(50) NOT NULL,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profile meal slots table
CREATE TABLE profile_meal_slots (
    user_id UNIQUEIDENTIFIER NOT NULL,
    meal_slot NVARCHAR(50) NOT NULL,
    CONSTRAINT fk_meal_slot_profile FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Categories table (global, admin-only)
CREATE TABLE categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL UNIQUE,
    sort_order INT NULL
);

-- Ingredients table (user-scoped)
CREATE TABLE ingredients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    owner_user_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    category_id UNIQUEIDENTIFIER NOT NULL,
    default_unit NVARCHAR(20) NOT NULL,
    package_amount DECIMAL(10, 2) NOT NULL,
    package_unit NVARCHAR(20) NOT NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_ingredient_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create indexes
CREATE NONCLUSTERED INDEX idx_users_email ON users(email);
CREATE NONCLUSTERED INDEX idx_users_household ON users(household_id);
CREATE NONCLUSTERED INDEX idx_ingredients_owner ON ingredients(owner_user_id);
CREATE NONCLUSTERED INDEX idx_ingredients_category ON ingredients(category_id);
CREATE NONCLUSTERED INDEX idx_ingredients_name ON ingredients(name);

-- Seed default categories
INSERT INTO categories (id, name, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111111', N'Dairy & Eggs', 1),
    ('22222222-2222-2222-2222-222222222222', N'Meat & Fish', 2),
    ('33333333-3333-3333-3333-333333333333', N'Fruits & Vegetables', 3),
    ('44444444-4444-4444-4444-444444444444', N'Bakery', 4),
    ('55555555-5555-5555-5555-555555555555', N'Pantry Staples', 5),
    ('66666666-6666-6666-6666-666666666666', N'Snacks & Sweets', 6),
    ('77777777-7777-7777-7777-777777777777', N'Beverages', 7),
    ('88888888-8888-8888-8888-888888888888', N'Frozen Foods', 8),
    ('99999999-9999-9999-9999-999999999999', N'Other', 9);
