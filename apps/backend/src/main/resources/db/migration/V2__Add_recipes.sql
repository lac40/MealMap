-- V2__Add_recipes.sql
-- MS SQL Server syntax

-- Recipes table
CREATE TABLE recipes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    owner_user_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    external_url NVARCHAR(2000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_recipe_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recipe items table
CREATE TABLE recipe_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    recipe_id UNIQUEIDENTIFIER NOT NULL,
    ingredient_id UNIQUEIDENTIFIER NOT NULL,
    quantity_amount DECIMAL(10, 2) NOT NULL,
    quantity_unit NVARCHAR(20) NOT NULL,
    package_note NVARCHAR(MAX) NULL,
    CONSTRAINT fk_recipe_item_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_item_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Create indexes
CREATE NONCLUSTERED INDEX idx_recipes_owner ON recipes(owner_user_id);
CREATE NONCLUSTERED INDEX idx_recipes_name ON recipes(name);
CREATE NONCLUSTERED INDEX idx_recipe_items_recipe ON recipe_items(recipe_id);
CREATE NONCLUSTERED INDEX idx_recipe_items_ingredient ON recipe_items(ingredient_id);
