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
    INSERT INTO recipe_templates (id, name, description, tags, dietary_tags, source, owner_user_id, immutable, created_at, updated_at)
    VALUES
        ('20000000-0000-0000-0000-000000000006', N'Classic Burger', N'Juicy homemade burger with all the fixings', 'burgers,quick,30-minutes', NULL, 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000007', N'Veggie Pizza', N'Fresh vegetable pizza with mozzarella', 'pizza,italian', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000008', N'Mushroom Risotto', N'Creamy Italian rice dish', 'italian,comfort-food', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000009', N'Caesar Wrap', N'Chicken Caesar salad in a tortilla', 'wraps,quick,15-minutes', 'high-protein', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000010', N'Vegetable Soup', N'Hearty mixed vegetable soup', 'soup,comfort-food', 'vegan', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000011', N'Turkey Meatballs', N'Lean turkey meatballs in tomato sauce', 'italian,meal-prep', 'high-protein', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000012', N'Quinoa Buddha Bowl', N'Healthy grain bowl with roasted vegetables', 'healthy,bowl', 'vegan', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000013', N'Beef Stir Fry with Rice', N'Quick Asian-style stir fry', 'asian,quick,30-minutes', 'high-protein', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000014', N'Caprese Sandwich', N'Fresh mozzarella, tomato, and basil sandwich', 'sandwich,quick,10-minutes', 'vegetarian', 'global', NULL, 1, GETUTCDATE(), GETUTCDATE()),
        ('20000000-0000-0000-0000-000000000015', N'Shrimp Pasta', N'Garlic shrimp with pasta', 'pasta,seafood,30-minutes', NULL, 'global', NULL, 1, GETUTCDATE(), GETUTCDATE());
END

-- Add recipe template items for new templates (6-15)
IF NOT EXISTS (SELECT 1 FROM recipe_template_items WHERE template_id = '20000000-0000-0000-0000-000000000006')
BEGIN
    -- Classic Burger (Template 6)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000051', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000018', 500, 'g', NULL),  -- Ground Beef
    ('21000000-0000-0000-0000-000000000052', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000073', 4, 'pc', NULL),   -- Hamburger Buns
    ('21000000-0000-0000-0000-000000000053', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000014', 100, 'g', NULL),  -- Cheddar Cheese
    ('21000000-0000-0000-0000-000000000054', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000061', 200, 'g', NULL),  -- Tomato
    ('21000000-0000-0000-0000-000000000055', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000070', 100, 'g', NULL),  -- Lettuce
    ('21000000-0000-0000-0000-000000000056', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 100, 'g', NULL);  -- Onion

    -- Veggie Pizza (Template 7)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000061', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000025', 300, 'g', NULL),  -- Flour
    ('21000000-0000-0000-0000-000000000062', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 200, 'g', NULL),  -- Canned Tomatoes
    ('21000000-0000-0000-0000-000000000063', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', 200, 'g', NULL),  -- Mozzarella
    ('21000000-0000-0000-0000-000000000064', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000063', 150, 'g', NULL),  -- Bell Pepper
    ('21000000-0000-0000-0000-000000000065', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000041', 100, 'g', NULL),  -- Mushrooms
    ('21000000-0000-0000-0000-000000000066', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', 100, 'g', NULL);  -- Onion

    -- Mushroom Risotto (Template 8)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000071', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000010', 300, 'g', NULL),  -- Rice
    ('21000000-0000-0000-0000-000000000072', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000041', 300, 'g', NULL),  -- Mushrooms
    ('21000000-0000-0000-0000-000000000073', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 100, 'g', NULL),  -- Onion
    ('21000000-0000-0000-0000-000000000074', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000013', 50, 'g', NULL),   -- Butter
    ('21000000-0000-0000-0000-000000000075', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 100, 'g', NULL),  -- Parmesan
    ('21000000-0000-0000-0000-000000000076', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 2, 'clove', NULL); -- Garlic

    -- Caesar Wrap (Template 9)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000081', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 300, 'g', NULL),  -- Chicken Breast
    ('21000000-0000-0000-0000-000000000082', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000072', 2, 'pc', NULL),   -- Tortillas
    ('21000000-0000-0000-0000-000000000083', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000070', 100, 'g', NULL),  -- Lettuce
    ('21000000-0000-0000-0000-000000000084', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 50, 'g', NULL),   -- Parmesan
    ('21000000-0000-0000-0000-000000000085', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000079', 50, 'ml', NULL);  -- Mayonnaise

    -- Vegetable Soup (Template 10)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000091', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000064', 300, 'g', NULL),  -- Carrot
    ('21000000-0000-0000-0000-000000000092', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 200, 'g', NULL),  -- Onion
    ('21000000-0000-0000-0000-000000000093', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000065', 200, 'g', NULL),  -- Celery
    ('21000000-0000-0000-0000-000000000094', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000061', 300, 'g', NULL),  -- Tomato
    ('21000000-0000-0000-0000-000000000095', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 3, 'clove', NULL), -- Garlic
    ('21000000-0000-0000-0000-000000000096', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000006', 400, 'g', NULL);  -- Canned Tomatoes

    -- Turkey Meatballs (Template 11)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000051', 500, 'g', NULL),  -- Ground Turkey
    ('21000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000071', 100, 'g', NULL),  -- Bread
    ('21000000-0000-0000-0000-000000000103', '20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 1, 'pc', NULL),   -- Egg
    ('21000000-0000-0000-0000-000000000104', '20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 2, 'clove', NULL), -- Garlic
    ('21000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 400, 'g', NULL);  -- Canned Tomatoes

    -- Quinoa Buddha Bowl (Template 12)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000111', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000024', 200, 'g', NULL),  -- Quinoa
    ('21000000-0000-0000-0000-000000000112', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000022', 200, 'g', NULL),  -- Chickpeas
    ('21000000-0000-0000-0000-000000000113', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000066', 200, 'g', NULL),  -- Broccoli
    ('21000000-0000-0000-0000-000000000114', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000068', 100, 'g', NULL),  -- Spinach
    ('21000000-0000-0000-0000-000000000115', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000064', 150, 'g', NULL),  -- Carrot
    ('21000000-0000-0000-0000-000000000116', '20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 30, 'ml', NULL);  -- Olive Oil

    -- Beef Stir Fry (Template 13)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000121', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000060', 500, 'g', NULL),  -- Beef Steak
    ('21000000-0000-0000-0000-000000000122', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000010', 300, 'g', NULL),  -- Rice
    ('21000000-0000-0000-0000-000000000123', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000063', 200, 'g', NULL),  -- Bell Pepper
    ('21000000-0000-0000-0000-000000000124', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000041', 150, 'g', NULL),  -- Mushrooms
    ('21000000-0000-0000-0000-000000000125', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000076', 30, 'ml', NULL),  -- Soy Sauce
    ('21000000-0000-0000-0000-000000000126', '20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 2, 'clove', NULL); -- Garlic

    -- Caprese Sandwich (Template 14)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000131', '20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000071', 200, 'g', NULL),  -- Bread
    ('21000000-0000-0000-0000-000000000132', '20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000015', 150, 'g', NULL),  -- Mozzarella
    ('21000000-0000-0000-0000-000000000133', '20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000061', 200, 'g', NULL),  -- Tomato
    ('21000000-0000-0000-0000-000000000134', '20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000036', 20, 'g', NULL),   -- Basil
    ('21000000-0000-0000-0000-000000000135', '20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 20, 'ml', NULL);  -- Olive Oil

    -- Shrimp Pasta (Template 15)
    INSERT INTO recipe_template_items (id, template_id, ingredient_id, quantity_amount, quantity_unit, package_note) VALUES
    ('21000000-0000-0000-0000-000000000141', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 400, 'g', NULL),  -- Pasta
    ('21000000-0000-0000-0000-000000000142', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000056', 300, 'g', NULL),  -- Shrimp
    ('21000000-0000-0000-0000-000000000143', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', 4, 'clove', NULL), -- Garlic
    ('21000000-0000-0000-0000-000000000144', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000061', 200, 'g', NULL),  -- Tomato
    ('21000000-0000-0000-0000-000000000145', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000068', 100, 'g', NULL),  -- Spinach
    ('21000000-0000-0000-0000-000000000146', '20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 30, 'ml', NULL);  -- Olive Oil
END
