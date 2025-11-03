-- Create planner_weeks table
CREATE TABLE planner_weeks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    start_date DATE NOT NULL,
    user_id UNIQUEIDENTIFIER,
    household_id UNIQUEIDENTIFIER,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE NO ACTION,
    CONSTRAINT chk_planner_week_owner CHECK (
        (user_id IS NOT NULL AND household_id IS NULL) OR
        (user_id IS NULL AND household_id IS NOT NULL)
    )
);

-- Create planner_items table
CREATE TABLE planner_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    date DATE NOT NULL,
    slot VARCHAR(20) NOT NULL CHECK (slot IN ('breakfast', 'snackAM', 'lunch', 'snackPM', 'dinner')),
    recipe_id UNIQUEIDENTIFIER,
    portions INT NOT NULL DEFAULT 1,
    added_by_user_id UNIQUEIDENTIFIER NOT NULL,
    planner_week_id UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (planner_week_id) REFERENCES planner_weeks(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_planner_weeks_start_date ON planner_weeks(start_date);
CREATE INDEX idx_planner_weeks_user_id ON planner_weeks(user_id);
CREATE INDEX idx_planner_weeks_household_id ON planner_weeks(household_id);
CREATE INDEX idx_planner_items_planner_week_id ON planner_items(planner_week_id);
CREATE INDEX idx_planner_items_date ON planner_items(date);
