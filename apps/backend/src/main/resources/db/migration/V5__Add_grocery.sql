-- V5: Add Grocery Lists
-- Grocery lists computed from planner weeks with pantry subtraction and trip splitting

CREATE TABLE grocery_lists (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    plan_week_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    household_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NULL,
    
    CONSTRAINT fk_grocery_lists_plan_week FOREIGN KEY (plan_week_id) REFERENCES planner_weeks(id) ON DELETE CASCADE,
    CONSTRAINT fk_grocery_lists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_grocery_lists_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    
    -- Ensure either user_id or household_id is set, but not both
    CONSTRAINT chk_grocery_lists_owner CHECK (
        (user_id IS NOT NULL AND household_id IS NULL) OR 
        (user_id IS NULL AND household_id IS NOT NULL)
    )
);

CREATE TABLE grocery_trips (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    grocery_list_id UNIQUEIDENTIFIER NOT NULL,
    trip_index INT NOT NULL,
    date_range_from DATE NOT NULL,
    date_range_to DATE NOT NULL,
    
    CONSTRAINT fk_grocery_trips_list FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE
);

CREATE TABLE grocery_trip_items (
    grocery_trip_id UNIQUEIDENTIFIER NOT NULL,
    ingredient_id UNIQUEIDENTIFIER NOT NULL,
    category_id UNIQUEIDENTIFIER NULL,
    needed_amount DECIMAL(10,2) NOT NULL,
    needed_unit VARCHAR(10) NOT NULL,
    after_pantry_amount DECIMAL(10,2) NOT NULL,
    after_pantry_unit VARCHAR(10) NOT NULL,
    checked BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_grocery_trip_items_trip FOREIGN KEY (grocery_trip_id) REFERENCES grocery_trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_grocery_trip_items_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT fk_grocery_trip_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes for query performance
CREATE INDEX idx_grocery_lists_plan_week ON grocery_lists(plan_week_id);
CREATE INDEX idx_grocery_lists_user ON grocery_lists(user_id);
CREATE INDEX idx_grocery_lists_household ON grocery_lists(household_id);
CREATE INDEX idx_grocery_trips_list ON grocery_trips(grocery_list_id);
CREATE INDEX idx_grocery_trip_items_trip ON grocery_trip_items(grocery_trip_id);
