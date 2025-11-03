-- Create pantry_items table
CREATE TABLE pantry_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ingredient_id UNIQUEIDENTIFIER NOT NULL,
    quantity_amount DECIMAL(10, 2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL CHECK (quantity_unit IN ('g', 'kg', 'ml', 'l', 'piece', 'pack')),
    user_id UNIQUEIDENTIFIER,
    household_id UNIQUEIDENTIFIER,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT chk_pantry_item_owner CHECK (
        (user_id IS NOT NULL AND household_id IS NULL) OR
        (user_id IS NULL AND household_id IS NOT NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_household_id ON pantry_items(household_id);
CREATE INDEX idx_pantry_items_ingredient_id ON pantry_items(ingredient_id);
