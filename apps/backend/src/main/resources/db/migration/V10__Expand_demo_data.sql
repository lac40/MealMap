-- V10__Expand_demo_data.sql
-- Expand demo ingredients to 85 items and add 10 additional global recipe templates

DECLARE @system_user UNIQUEIDENTIFIER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
DECLARE @cat_dairy UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @cat_meat UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @cat_produce UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @cat_bakery UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';
DECLARE @cat_pantry UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';
DECLARE @cat_snacks UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666';
DECLARE @cat_bev UNIQUEIDENTIFIER = '77777777-7777-7777-7777-777777777777';
DECLARE @cat_frozen UNIQUEIDENTIFIER = '88888888-8888-8888-8888-888888888888';
DECLARE @cat_other UNIQUEIDENTIFIER = '99999999-9999-9999-9999-999999999999';

-- Add 35 more ingredients (51-85) to reach 85 total
IF NOT EXISTS (SELECT 1 FROM ingredients WHERE id = '10000000-0000-0000-0000-000000000051')
BEGIN
    INSERT INTO ingredients (id, owner_user_id, name, category_id, default_unit, package_amount, package_unit, notes)
    VALUES
        -- More Meat & Fish (51-60)
        ('10000000-0000-0000-0000-000000000051', @system_user, N'Ground Turkey', @cat_meat, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000052', @system_user, N'Chicken Thighs', @cat_meat, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000053', @system_user, N'Pork Chops', @cat_meat, 'g', 800, 'g', NULL),
        ('10000000-0000-0000-0000-000000000054', @system_user, N'Bacon', @cat_meat, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000055', @system_user, N'Salmon Fillet', @cat_meat, 'g', 600, 'g', NULL),
        ('10000000-0000-0000-0000-000000000056', @system_user, N'Shrimp', @cat_meat, 'g', 500, 'g', N'Peeled and deveined'),
        ('10000000-0000-0000-0000-000000000057', @system_user, N'Tuna', @cat_meat, 'g', 400, 'g', N'Canned in water'),
        ('10000000-0000-0000-0000-000000000058', @system_user, N'Cod Fillet', @cat_meat, 'g', 600, 'g', NULL),
        ('10000000-0000-0000-0000-000000000059', @system_user, N'Ground Pork', @cat_meat, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000060', @system_user, N'Beef Steak', @cat_meat, 'g', 800, 'g', NULL),
        
        -- More Produce (61-70)
        ('10000000-0000-0000-0000-000000000061', @system_user, N'Tomato', @cat_produce, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000062', @system_user, N'Cucumber', @cat_produce, 'g', 400, 'g', NULL),
        ('10000000-0000-0000-0000-000000000063', @system_user, N'Bell Pepper', @cat_produce, 'g', 200, 'g', NULL),
        ('10000000-0000-0000-0000-000000000064', @system_user, N'Carrot', @cat_produce, 'g', 1000, 'g', NULL),
        ('10000000-0000-0000-0000-000000000065', @system_user, N'Celery', @cat_produce, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000066', @system_user, N'Broccoli', @cat_produce, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000067', @system_user, N'Cauliflower', @cat_produce, 'g', 800, 'g', NULL),
        ('10000000-0000-0000-0000-000000000068', @system_user, N'Spinach', @cat_produce, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000069', @system_user, N'Kale', @cat_produce, 'g', 300, 'g', NULL),
        ('10000000-0000-0000-0000-000000000070', @system_user, N'Lettuce', @cat_produce, 'g', 400, 'g', NULL),
        
        -- Bakery items (71-75)
        ('10000000-0000-0000-0000-000000000071', @system_user, N'Bread', @cat_bakery, 'g', 500, 'g', N'Sliced loaf'),
        ('10000000-0000-0000-0000-000000000072', @system_user, N'Tortillas', @cat_bakery, 'pc', 10, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000073', @system_user, N'Hamburger Buns', @cat_bakery, 'pc', 8, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000074', @system_user, N'Bagels', @cat_bakery, 'pc', 6, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000075', @system_user, N'Pita Bread', @cat_bakery, 'pc', 6, 'pc', NULL),
        
        -- More Pantry (76-80)
        ('10000000-0000-0000-0000-000000000076', @system_user, N'Soy Sauce', @cat_pantry, 'ml', 250, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000077', @system_user, N'Honey', @cat_pantry, 'ml', 350, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000078', @system_user, N'Peanut Butter', @cat_pantry, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000079', @system_user, N'Mayonnaise', @cat_pantry, 'ml', 400, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000080', @system_user, N'Mustard', @cat_pantry, 'ml', 250, 'ml', NULL),
        
        -- Beverages & Other (81-85)
        ('10000000-0000-0000-0000-000000000081', @system_user, N'Orange Juice', @cat_bev, 'ml', 1000, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000082', @system_user, N'Apple Juice', @cat_bev, 'ml', 1000, 'ml', NULL),
        ('10000000-0000-0000-0000-000000000083', @system_user, N'Coffee Beans', @cat_bev, 'g', 500, 'g', NULL),
        ('10000000-0000-0000-0000-000000000084', @system_user, N'Tea Bags', @cat_bev, 'pc', 25, 'pc', NULL),
        ('10000000-0000-0000-0000-000000000085', @system_user, N'Tofu', @cat_other, 'g', 400, 'g', NULL);
END

-- Add 10 more global recipe templates (6-15)
IF NOT EXISTS (SELECT 1 FROM recipe_templates WHERE id = '20000000-0000-0000-0000-000000000006')
BEGIN
    INSERT INTO recipe_templates (id, name, description, cooking_time, difficulty, servings, source, owner_user_id)
    VALUES
        ('20000000-0000-0000-0000-000000000006', N'Classic Burger', N'Juicy homemade burger with all the fixings', 20, 'Easy', 4, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000007', N'Veggie Pizza', N'Fresh vegetable pizza with mozzarella', 35, 'Medium', 4, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000008', N'Mushroom Risotto', N'Creamy Italian rice dish', 40, 'Medium', 4, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000009', N'Caesar Wrap', N'Chicken Caesar salad in a tortilla', 15, 'Easy', 2, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000010', N'Vegetable Soup', N'Hearty mixed vegetable soup', 45, 'Easy', 6, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000011', N'Turkey Meatballs', N'Lean turkey meatballs in tomato sauce', 35, 'Medium', 4, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000012', N'Quinoa Buddha Bowl', N'Healthy grain bowl with roasted vegetables', 30, 'Easy', 2, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000013', N'Beef Stir Fry with Rice', N'Quick Asian-style stir fry', 25, 'Easy', 4, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000014', N'Caprese Sandwich', N'Fresh mozzarella, tomato, and basil sandwich', 10, 'Easy', 2, 'global', @system_user),
        ('20000000-0000-0000-0000-000000000015', N'Shrimp Pasta', N'Garlic shrimp with pasta', 25, 'Medium', 4, 'global', @system_user);
END

-- Add recipe template items for new templates (6-15)
IF NOT EXISTS (SELECT 1 FROM recipe_template_items WHERE template_id = '20000000-0000-0000-0000-000000000006')
BEGIN
    -- Classic Burger (Template 6)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000018', 500, 'g'),  -- Ground Beef
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000073', 4, 'pc'),   -- Hamburger Buns
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000014', 100, 'g'),  -- Cheddar Cheese
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000061', 200, 'g'),  -- Tomato
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000070', 100, 'g'),  -- Lettuce
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 100, 'g');  -- Onion

    -- Veggie Pizza (Template 7)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000025', 300, 'g'),  -- Flour
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 200, 'g'),  -- Canned Tomatoes
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', 200, 'g'),  -- Mozzarella
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000063', 150, 'g'),  -- Bell Pepper
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000041', 100, 'g'),  -- Mushrooms
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', 100, 'g');  -- Onion

    -- Mushroom Risotto (Template 8)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000010', 300, 'g'),  -- Rice
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000041', 300, 'g'),  -- Mushrooms
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 100, 'g'),  -- Onion
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000013', 50, 'g'),   -- Butter
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 100, 'g'),  -- Parmesan
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 2, 'clove'); -- Garlic

    -- Caesar Wrap (Template 9)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 300, 'g'),  -- Chicken Breast
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000072', 2, 'pc'),   -- Tortillas
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000070', 100, 'g'),  -- Lettuce
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 50, 'g'),   -- Parmesan
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000079', 50, 'ml');  -- Mayonnaise

    -- Vegetable Soup (Template 10)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000064', 300, 'g'),  -- Carrot
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 200, 'g'),  -- Onion
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000065', 200, 'g'),  -- Celery
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000061', 300, 'g'),  -- Tomato
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 3, 'clove'), -- Garlic
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000006', 400, 'g');  -- Canned Tomatoes

    -- Turkey Meatballs (Template 11)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000051', 500, 'g'),  -- Ground Turkey
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000071', 100, 'g'),  -- Bread
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 1, 'pc'),   -- Egg
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 2, 'clove'), -- Garlic
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 400, 'g');  -- Canned Tomatoes

    -- Quinoa Buddha Bowl (Template 12)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000024', 200, 'g'),  -- Quinoa
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000022', 200, 'g'),  -- Chickpeas
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000066', 200, 'g'),  -- Broccoli
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000068', 100, 'g'),  -- Spinach
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000064', 150, 'g'),  -- Carrot
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 30, 'ml');  -- Olive Oil

    -- Beef Stir Fry (Template 13)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000060', 500, 'g'),  -- Beef Steak
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000010', 300, 'g'),  -- Rice
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000063', 200, 'g'),  -- Bell Pepper
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000041', 150, 'g'),  -- Mushrooms
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000076', 30, 'ml'),  -- Soy Sauce
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 2, 'clove'); -- Garlic

    -- Caprese Sandwich (Template 14)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000071', 200, 'g'),  -- Bread
    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000015', 150, 'g'),  -- Mozzarella
    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000061', 200, 'g'),  -- Tomato
    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000036', 20, 'g'),   -- Basil
    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 20, 'ml');  -- Olive Oil

    -- Shrimp Pasta (Template 15)
    INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 400, 'g'),  -- Pasta
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000056', 300, 'g'),  -- Shrimp
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', 4, 'clove'), -- Garlic
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000061', 200, 'g'),  -- Tomato
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000068', 100, 'g'),  -- Spinach
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 30, 'ml');  -- Olive Oil
END
