-- V8__Add_recipe_templates.sql
-- MS SQL Server syntax

-- Recipe templates table
CREATE TABLE recipe_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(2000) NULL,
    tags NVARCHAR(MAX) NULL,
    dietary_tags NVARCHAR(MAX) NULL,
    source NVARCHAR(20) NOT NULL,
    owner_user_id UNIQUEIDENTIFIER NULL,
    immutable BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_recipe_template_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recipe template items table
CREATE TABLE recipe_template_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER NOT NULL,
    ingredient_id UNIQUEIDENTIFIER NOT NULL,
    quantity_amount DECIMAL(10, 2) NOT NULL,
    quantity_unit NVARCHAR(20) NOT NULL,
    package_note NVARCHAR(4000) NULL,
    CONSTRAINT fk_recipe_template_item_template FOREIGN KEY (template_id) REFERENCES recipe_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_template_item_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Preferences per user per template
CREATE TABLE recipe_template_preferences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    favorite BIT NOT NULL DEFAULT 0,
    hidden BIT NOT NULL DEFAULT 0,
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_recipe_template_pref_template FOREIGN KEY (template_id) REFERENCES recipe_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_template_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_recipe_template_pref UNIQUE (template_id, user_id)
);

-- Indexes
CREATE NONCLUSTERED INDEX idx_recipe_templates_owner ON recipe_templates(owner_user_id);
CREATE NONCLUSTERED INDEX idx_recipe_templates_source ON recipe_templates(source);
CREATE NONCLUSTERED INDEX idx_recipe_template_items_template ON recipe_template_items(template_id);
CREATE NONCLUSTERED INDEX idx_recipe_template_items_ingredient ON recipe_template_items(ingredient_id);
CREATE NONCLUSTERED INDEX idx_recipe_template_prefs_user ON recipe_template_preferences(user_id);
