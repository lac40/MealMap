-- V9__Seed_template_data.sql
-- Seed system template user, 50 baseline ingredients, and 10 global recipe templates

DECLARE @system_user UNIQUEIDENTIFIER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
DECLARE @cat_dairy UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @cat_meat UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @cat_produce UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @cat_pantry UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';
DECLARE @cat_snacks UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666';
DECLARE @cat_bev UNIQUEIDENTIFIER = '77777777-7777-7777-7777-777777777777';
DECLARE @cat_frozen UNIQUEIDENTIFIER = '88888888-8888-8888-8888-888888888888';

IF NOT EXISTS (SELECT 1 FROM users WHERE id = @system_user)
BEGIN
    INSERT INTO users (id, email, password_hash, display_name, avatar_url, mfa_enabled, email_verified, household_id, created_at)
    VALUES (@system_user, 'templates@mealmap.local', 'SYSTEM_SEED_DO_NOT_LOGIN', 'MealMap Templates', NULL, 0, 1, NULL, GETUTCDATE());

    INSERT INTO profiles (user_id, role) VALUES (@system_user, 'admin');
END

-- Seed 50 baseline ingredients owned by the system template user
IF NOT EXISTS (SELECT 1 FROM ingredients WHERE id = '10000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO ingredients (id, owner_user_id, name, category_id, default_unit, package_amount, package_unit, notes)
    VALUES
        ('10000000-0000-0000-0000-000000000001', @system_user, N'Olive Oil', @cat_pantry, 'ml', 500, 'ml', N'Extra virgin'),
        ('10000000-0000-0000-0000-000000000002', @system_user, N'Salt', @cat_pantry, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000003', @system_user, N'Black Pepper', @cat_pantry, 'g', 100, 'g', NULL),
        ('10000000-0000-0000-0000-000000000004', @system_user, N'Garlic Clove', @cat_produce, 'clove', 1, 'head', NULL),
        ('10000000-0000-0000-0000-000000000005', @system_user, N'Yellow Onion', @cat_produce, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000006', @system_user, N'Canned Tomatoes', @cat_pantry, 'g', 400, 'g', N'400g can'),
        ('10000000-0000-0000-0000-000000000007', @system_user, N'Dried Pasta', @cat_pantry, 'g', 500, 'g', N'Spaghetti or penne'),
        ('10000000-0000-0000-0000-000000000008', @system_user, N'Parmesan Cheese', @cat_dairy, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000009', @system_user, N'Chicken Breast', @cat_meat, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000010', @system_user, N'Long Grain Rice', @cat_pantry, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000011', @system_user, N'Eggs', @cat_dairy, 'pc', 12, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000012', @system_user, N'Milk', @cat_dairy, 'ml', 1000, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000013', @system_user, N'Butter', @cat_dairy, 'g', 250, 'g', NULL),
        ('10000000-0000-0000-0000-000000000014', @system_user, N'Cheddar Cheese', @cat_dairy, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000015', @system_user, N'Mozzarella Cheese', @cat_dairy, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000016', @system_user, N'Greek Yogurt', @cat_dairy, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000017', @system_user, N'Sour Cream', @cat_dairy, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000018', @system_user, N'Ground Beef', @cat_meat, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000019', @system_user, N'Pork Shoulder', @cat_meat, 'g', 1500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000020', @system_user, N'Canned Black Beans', @cat_pantry, 'g', 400, 'g', NULL),
        ('10000000-0000-0000-0000-000000000021', @system_user, N'Canned Kidney Beans', @cat_pantry, 'g', 400, 'g', NULL),
        ('10000000-0000-0000-0000-000000000022', @system_user, N'Canned Chickpeas', @cat_pantry, 'g', 400, 'g', NULL),
        ('10000000-0000-0000-0000-000000000023', @system_user, N'Dry Lentils', @cat_pantry, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000024', @system_user, N'Quinoa', @cat_pantry, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000025', @system_user, N'All-Purpose Flour', @cat_pantry, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000026', @system_user, N'Baking Powder', @cat_pantry, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000027', @system_user, N'Brown Sugar', @cat_pantry, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000028', @system_user, N'Maple Syrup', @cat_snacks, 'ml', 250, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000029', @system_user, N'Honey', @cat_snacks, 'ml', 250, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000030', @system_user, N'Soy Sauce', @cat_pantry, 'ml', 250, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000031', @system_user, N'Rice Vinegar', @cat_pantry, 'ml', 250, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000032', @system_user, N'Sesame Oil', @cat_pantry, 'ml', 150, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000033', @system_user, N'Bell Pepper', @cat_produce, 'g', 150, 'g', NULL),
        ('10000000-0000-0000-0000-000000000034', @system_user, N'Broccoli Florets', @cat_produce, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000035', @system_user, N'Carrot', @cat_produce, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000036', @system_user, N'Celery', @cat_produce, 'g', 400, 'g', NULL),
        ('10000000-0000-0000-0000-000000000037', @system_user, N'Spinach', @cat_produce, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000038', @system_user, N'Cherry Tomatoes', @cat_produce, 'g', 250, 'g', NULL),
        ('10000000-0000-0000-0000-000000000039', @system_user, N'Cucumber', @cat_produce, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000040', @system_user, N'Avocado', @cat_produce, 'pc', 4, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000041', @system_user, N'Lime', @cat_produce, 'pc', 6, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000042', @system_user, N'Flour Tortillas', @cat_pantry, 'pc', 12, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000043', @system_user, N'Tortilla Chips', @cat_snacks, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000044', @system_user, N'Frozen Corn', @cat_frozen, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000045', @system_user, N'Frozen Peas', @cat_frozen, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000046', @system_user, N'Red Onion', @cat_produce, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000047', @system_user, N'Feta Cheese', @cat_dairy, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000048', @system_user, N'Kalamata Olives', @cat_pantry, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000049', @system_user, N'Canned Tuna', @cat_meat, 'g', 160, 'g', N'Standard can'),
        ('10000000-0000-0000-0000-000000000050', @system_user, N'Vegetable Broth', @cat_pantry, 'ml', 1000, 'ml', NULL);
END

-- Seed global recipe templates (10 total)
DECLARE @tpl_pasta UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000001';
DECLARE @tpl_chicken_rice UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000002';
DECLARE @tpl_stir_fry UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000003';
DECLARE @tpl_beef_chili UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000004';
DECLARE @tpl_omelette UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000005';
DECLARE @tpl_pancakes UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000006';
DECLARE @tpl_tuna_salad UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000007';
DECLARE @tpl_beef_tacos UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000008';
DECLARE @tpl_lentil_soup UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000009';
DECLARE @tpl_greek_salad UNIQUEIDENTIFIER = '20000000-0000-0000-0000-000000000010';

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_pasta)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_pasta, N'Simple Tomato Garlic Pasta', N'Pantry-friendly pasta with tomatoes, garlic, and parmesan.', 'pasta,quick,30-minutes', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('21000000-0000-0000-0000-000000000001', @tpl_pasta, '10000000-0000-0000-0000-000000000007', 200, 'g', NULL), -- Dried Pasta
        ('21000000-0000-0000-0000-000000000002', @tpl_pasta, '10000000-0000-0000-0000-000000000006', 400, 'g', N'Use canned diced or crushed tomatoes'),
        ('21000000-0000-0000-0000-000000000003', @tpl_pasta, '10000000-0000-0000-0000-000000000004', 3, 'clove', NULL),
        ('21000000-0000-0000-0000-000000000004', @tpl_pasta, '10000000-0000-0000-0000-000000000005', 100, 'g', NULL),
        ('21000000-0000-0000-0000-000000000005', @tpl_pasta, '10000000-0000-0000-0000-000000000001', 15, 'ml', NULL),
        ('21000000-0000-0000-0000-000000000006', @tpl_pasta, '10000000-0000-0000-0000-000000000002', 5, 'g', NULL),
        ('21000000-0000-0000-0000-000000000007', @tpl_pasta, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL),
        ('21000000-0000-0000-0000-000000000008', @tpl_pasta, '10000000-0000-0000-0000-000000000008', 20, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_chicken_rice)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_chicken_rice, N'Garlic Chicken & Rice', N'One-pan chicken and rice with garlic and aromatics.', 'meal-prep,high-protein,one-pan', 'gluten-free', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('22000000-0000-0000-0000-000000000001', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000009', 500, 'g', NULL), -- Chicken Breast
        ('22000000-0000-0000-0000-000000000002', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000010', 200, 'g', NULL), -- Long Grain Rice
        ('22000000-0000-0000-0000-000000000003', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000004', 4, 'clove', NULL),
        ('22000000-0000-0000-0000-000000000004', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000005', 120, 'g', NULL),
        ('22000000-0000-0000-0000-000000000005', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000001', 20, 'ml', NULL),
        ('22000000-0000-0000-0000-000000000006', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000002', 6, 'g', NULL),
        ('22000000-0000-0000-0000-000000000007', @tpl_chicken_rice, '10000000-0000-0000-0000-000000000003', 3, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_stir_fry)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_stir_fry, N'Veggie Garlic Stir Fry', N'Quick veggie stir fry with rice and soy garlic sauce.', 'stir-fry,30-minutes,vegetarian', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('23000000-0000-0000-0000-000000000001', @tpl_stir_fry, '10000000-0000-0000-0000-000000000010', 180, 'g', NULL),
        ('23000000-0000-0000-0000-000000000002', @tpl_stir_fry, '10000000-0000-0000-0000-000000000034', 200, 'g', NULL),
        ('23000000-0000-0000-0000-000000000003', @tpl_stir_fry, '10000000-0000-0000-0000-000000000033', 150, 'g', NULL),
        ('23000000-0000-0000-0000-000000000004', @tpl_stir_fry, '10000000-0000-0000-0000-000000000035', 120, 'g', NULL),
        ('23000000-0000-0000-0000-000000000005', @tpl_stir_fry, '10000000-0000-0000-0000-000000000004', 3, 'clove', NULL),
        ('23000000-0000-0000-0000-000000000006', @tpl_stir_fry, '10000000-0000-0000-0000-000000000005', 80, 'g', NULL),
        ('23000000-0000-0000-0000-000000000007', @tpl_stir_fry, '10000000-0000-0000-0000-000000000030', 30, 'ml', NULL),
        ('23000000-0000-0000-0000-000000000008', @tpl_stir_fry, '10000000-0000-0000-0000-000000000032', 10, 'ml', NULL),
        ('23000000-0000-0000-0000-000000000009', @tpl_stir_fry, '10000000-0000-0000-0000-000000000002', 4, 'g', NULL),
        ('23000000-0000-0000-0000-000000000010', @tpl_stir_fry, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_beef_chili)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_beef_chili, N'Hearty Beef Chili', N'Comfort chili with beans, tomatoes, and ground beef.', 'stew,high-protein,meal-prep', 'gluten-free', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('24000000-0000-0000-0000-000000000001', @tpl_beef_chili, '10000000-0000-0000-0000-000000000018', 500, 'g', NULL),
        ('24000000-0000-0000-0000-000000000002', @tpl_beef_chili, '10000000-0000-0000-0000-000000000020', 400, 'g', NULL),
        ('24000000-0000-0000-0000-000000000003', @tpl_beef_chili, '10000000-0000-0000-0000-000000000021', 400, 'g', NULL),
        ('24000000-0000-0000-0000-000000000004', @tpl_beef_chili, '10000000-0000-0000-0000-000000000006', 400, 'g', NULL),
        ('24000000-0000-0000-0000-000000000005', @tpl_beef_chili, '10000000-0000-0000-0000-000000000033', 120, 'g', NULL),
        ('24000000-0000-0000-0000-000000000006', @tpl_beef_chili, '10000000-0000-0000-0000-000000000046', 80, 'g', NULL),
        ('24000000-0000-0000-0000-000000000007', @tpl_beef_chili, '10000000-0000-0000-0000-000000000004', 4, 'clove', NULL),
        ('24000000-0000-0000-0000-000000000008', @tpl_beef_chili, '10000000-0000-0000-0000-000000000002', 6, 'g', NULL),
        ('24000000-0000-0000-0000-000000000009', @tpl_beef_chili, '10000000-0000-0000-0000-000000000003', 3, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_omelette)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_omelette, N'Cheddar Omelette', N'3-egg omelette with cheddar and herbs.', 'breakfast,quick,high-protein', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('25000000-0000-0000-0000-000000000001', @tpl_omelette, '10000000-0000-0000-0000-000000000011', 3, 'pc', NULL),
        ('25000000-0000-0000-0000-000000000002', @tpl_omelette, '10000000-0000-0000-0000-000000000013', 10, 'g', NULL),
        ('25000000-0000-0000-0000-000000000003', @tpl_omelette, '10000000-0000-0000-0000-000000000014', 30, 'g', NULL),
        ('25000000-0000-0000-0000-000000000004', @tpl_omelette, '10000000-0000-0000-0000-000000000012', 30, 'ml', NULL),
        ('25000000-0000-0000-0000-000000000005', @tpl_omelette, '10000000-0000-0000-0000-000000000002', 3, 'g', NULL),
        ('25000000-0000-0000-0000-000000000006', @tpl_omelette, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_pancakes)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_pancakes, N'Fluffy Pancakes', N'Classic pancakes ready in 20 minutes.', 'breakfast,sweet,quick', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('26000000-0000-0000-0000-000000000001', @tpl_pancakes, '10000000-0000-0000-0000-000000000025', 150, 'g', NULL),
        ('26000000-0000-0000-0000-000000000002', @tpl_pancakes, '10000000-0000-0000-0000-000000000026', 6, 'g', NULL),
        ('26000000-0000-0000-0000-000000000003', @tpl_pancakes, '10000000-0000-0000-0000-000000000011', 1, 'pc', NULL),
        ('26000000-0000-0000-0000-000000000004', @tpl_pancakes, '10000000-0000-0000-0000-000000000012', 200, 'ml', NULL),
        ('26000000-0000-0000-0000-000000000005', @tpl_pancakes, '10000000-0000-0000-0000-000000000013', 20, 'g', NULL),
        ('26000000-0000-0000-0000-000000000006', @tpl_pancakes, '10000000-0000-0000-0000-000000000027', 15, 'g', NULL),
        ('26000000-0000-0000-0000-000000000007', @tpl_pancakes, '10000000-0000-0000-0000-000000000028', 30, 'ml', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_tuna_salad)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_tuna_salad, N'Crunchy Tuna Salad', N'Tuna salad with yogurt dressing, celery, and lime.', 'salad,high-protein,lunch', 'pescatarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('27000000-0000-0000-0000-000000000001', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000049', 160, 'g', NULL),
        ('27000000-0000-0000-0000-000000000002', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000016', 60, 'g', NULL),
        ('27000000-0000-0000-0000-000000000003', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000036', 60, 'g', NULL),
        ('27000000-0000-0000-0000-000000000004', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000046', 40, 'g', NULL),
        ('27000000-0000-0000-0000-000000000005', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000041', 1, 'pc', N'Juice only'),
        ('27000000-0000-0000-0000-000000000006', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000002', 3, 'g', NULL),
        ('27000000-0000-0000-0000-000000000007', @tpl_tuna_salad, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_beef_tacos)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_beef_tacos, N'Beef Tacos', N'Skillet beef tacos with peppers, onion, and lime.', 'tacos,weeknight,high-protein', 'gluten-free-option', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('28000000-0000-0000-0000-000000000001', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000018', 400, 'g', NULL),
        ('28000000-0000-0000-0000-000000000002', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000042', 6, 'pc', NULL),
        ('28000000-0000-0000-0000-000000000003', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000033', 120, 'g', NULL),
        ('28000000-0000-0000-0000-000000000004', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000046', 60, 'g', NULL),
        ('28000000-0000-0000-0000-000000000005', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000004', 3, 'clove', NULL),
        ('28000000-0000-0000-0000-000000000006', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000041', 1, 'pc', N'Juice only'),
        ('28000000-0000-0000-0000-000000000007', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000002', 5, 'g', NULL),
        ('28000000-0000-0000-0000-000000000008', @tpl_beef_tacos, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_lentil_soup)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_lentil_soup, N'Cozy Lentil Soup', N'Lentil soup with vegetables and broth.', 'soup,vegetarian,meal-prep', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('29000000-0000-0000-0000-000000000001', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000023', 200, 'g', NULL),
        ('29000000-0000-0000-0000-000000000002', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000035', 120, 'g', NULL),
        ('29000000-0000-0000-0000-000000000003', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000036', 80, 'g', NULL),
        ('29000000-0000-0000-0000-000000000004', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000005', 100, 'g', NULL),
        ('29000000-0000-0000-0000-000000000005', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000046', 60, 'g', NULL),
        ('29000000-0000-0000-0000-000000000006', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000004', 3, 'clove', NULL),
        ('29000000-0000-0000-0000-000000000007', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000006', 400, 'g', NULL),
        ('29000000-0000-0000-0000-000000000008', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000050', 800, 'ml', NULL),
        ('29000000-0000-0000-0000-000000000009', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000002', 5, 'g', NULL),
        ('29000000-0000-0000-0000-000000000010', @tpl_lentil_soup, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END

IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = @tpl_greek_salad)
BEGIN
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES (@tpl_greek_salad, N'Greek Salad', N'Fresh salad with feta, olives, and lime dressing.', 'salad,vegetarian,quick', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());

    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
        ('30000000-0000-0000-0000-000000000001', @tpl_greek_salad, '10000000-0000-0000-0000-000000000038', 180, 'g', NULL),
        ('30000000-0000-0000-0000-000000000002', @tpl_greek_salad, '10000000-0000-0000-0000-000000000039', 180, 'g', NULL),
        ('30000000-0000-0000-0000-000000000003', @tpl_greek_salad, '10000000-0000-0000-0000-000000000046', 80, 'g', NULL),
        ('30000000-0000-0000-0000-000000000004', @tpl_greek_salad, '10000000-0000-0000-0000-000000000047', 60, 'g', NULL),
        ('30000000-0000-0000-0000-000000000005', @tpl_greek_salad, '10000000-0000-0000-0000-000000000048', 50, 'g', NULL),
        ('30000000-0000-0000-0000-000000000006', @tpl_greek_salad, '10000000-0000-0000-0000-000000000001', 20, 'ml', NULL),
        ('30000000-0000-0000-0000-000000000007', @tpl_greek_salad, '10000000-0000-0000-0000-000000000041', 1, 'pc', N'Juice only'),
        ('30000000-0000-0000-0000-000000000008', @tpl_greek_salad, '10000000-0000-0000-0000-000000000002', 4, 'g', NULL),
        ('30000000-0000-0000-0000-000000000009', @tpl_greek_salad, '10000000-0000-0000-0000-000000000003', 2, 'g', NULL);
END
