-- V10__Expand_demo_data.sql
-- Comprehensive demo data with expanded ingredients and enhanced recipe templates

-- Delete existing demo ingredients and templates to start fresh
DELETE FROM recipe_template_items WHERE template_id IN (SELECT id FROM recipe_templates WHERE source = 'global');
DELETE FROM recipe_templates WHERE source = 'global';
DELETE FROM ingredients WHERE owner_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Insert expanded set of common ingredients (100+ items)
INSERT INTO ingredients (id, name, category, owner_user_id, created_at, updated_at) VALUES
-- Proteins
('10000000-0000-0000-0000-000000000001', 'Chicken Breast', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000002', 'Ground Beef', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000003', 'Salmon Fillet', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000004', 'Eggs', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000005', 'Greek Yogurt', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000006', 'Cheddar Cheese', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000007', 'Mozzarella Cheese', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000008', 'Parmesan Cheese', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000009', 'Tofu', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000010', 'Lentils', 'Legumes', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Vegetables
('10000000-0000-0000-0000-000000000011', 'Tomato', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000012', 'Onion', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000013', 'Garlic', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000014', 'Bell Pepper', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000015', 'Spinach', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000016', 'Broccoli', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000017', 'Carrot', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000018', 'Cucumber', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000019', 'Zucchini', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000020', 'Mushroom', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000021', 'Potato', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000022', 'Sweet Potato', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000023', 'Lettuce', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000024', 'Celery', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000025', 'Asparagus', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Fruits
('10000000-0000-0000-0000-000000000026', 'Banana', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000027', 'Apple', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000028', 'Orange', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000029', 'Strawberry', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000030', 'Blueberry', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000031', 'Lemon', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000032', 'Lime', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000033', 'Avocado', 'Fruits', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Grains & Starches
('10000000-0000-0000-0000-000000000034', 'White Rice', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000035', 'Brown Rice', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000036', 'Pasta', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000037', 'Bread', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000038', 'Whole Wheat Bread', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000039', 'Oatmeal', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000040', 'Couscous', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Sauces & Condiments
('10000000-0000-0000-0000-000000000041', 'Olive Oil', 'Oils', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000042', 'Soy Sauce', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000043', 'Honey', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000044', 'Tomato Sauce', 'Sauces', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000045', 'Peanut Butter', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000046', 'Mayonnaise', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000047', 'Mustard', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000048', 'Balsamic Vinegar', 'Oils', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000049', 'Apple Cider Vinegar', 'Oils', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000050', 'Worcestershire Sauce', 'Condiments', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Dairy Products
('10000000-0000-0000-0000-000000000051', 'Milk', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000052', 'Butter', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000053', 'Heavy Cream', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Spices & Seasonings
('10000000-0000-0000-0000-000000000054', 'Salt', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000055', 'Black Pepper', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000056', 'Cumin', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000057', 'Paprika', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000058', 'Cinnamon', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000059', 'Ginger', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000060', 'Turmeric', 'Spices', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000061', 'Basil', 'Herbs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000062', 'Oregano', 'Herbs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000063', 'Thyme', 'Herbs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000064', 'Rosemary', 'Herbs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000065', 'Cilantro', 'Herbs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- More Proteins & Seafood
('10000000-0000-0000-0000-000000000066', 'Ground Turkey', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000067', 'Shrimp', 'Seafood', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000068', 'Tuna', 'Seafood', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000069', 'Cod', 'Seafood', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000070', 'Ground Chicken', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000071', 'Chicken Thighs', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000072', 'Pork Chops', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000073', 'Beef Steak', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000074', 'Bacon', 'Protein', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000075', 'Chickpeas', 'Legumes', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Vegetables continued
('10000000-0000-0000-0000-000000000076', 'Cauliflower', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000077', 'Green Beans', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000078', 'Peas', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000079', 'Corn', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000080', 'Kale', 'Vegetables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
-- Special items
('10000000-0000-0000-0000-000000000081', 'Coconut Milk', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000082', 'Almond Milk', 'Dairy', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000083', 'Tortilla', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000084', 'Beans', 'Legumes', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE()),
('10000000-0000-0000-0000-000000000085', 'Quinoa', 'Grains', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', GETDATE(), GETDATE());

-- Insert enhanced recipe templates with better descriptions and tags
INSERT INTO recipe_templates (id, name, description, source, owner_user_id, tags, dietary_tags, favorite, hidden, immutable, created_at, updated_at) VALUES
('20000000-0000-0000-0000-000000000001', 'Classic Spaghetti Carbonara', 'Traditional Italian pasta with creamy egg sauce, crispy bacon, and Pecorino cheese. Quick, delicious, and authentic.', 'global', NULL, 'italian,classic,quick,dinner', 'vegetarian,dairy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000002', 'Grilled Chicken with Roasted Vegetables', 'Juicy grilled chicken breast served with a medley of seasonal roasted vegetables. Healthy and satisfying meal for any day.', 'global', NULL, 'grilled,healthy,protein,dinner', 'gluten-free,dairy-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000003', 'Thai Green Curry', 'Aromatic green curry with chicken, vegetables, and coconut milk. Authentic Thai flavors that''ll impress your guests.', 'global', NULL, 'thai,curry,asian,dinner', 'gluten-free,dairy-free,spicy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000004', 'Beef Tacos', 'Seasoned ground beef in warm tortillas with fresh toppings. Perfect for casual family dinner or gathering.', 'global', NULL, 'mexican,tacos,casual,dinner', 'dairy-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000005', 'Vegetable Stir Fry', 'Colorful mix of fresh vegetables in a savory Asian-inspired sauce. Quick, healthy, and naturally vegetarian.', 'global', NULL, 'asian,quick,healthy,vegetarian', 'vegan,gluten-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000006', 'Greek Salad', 'Fresh tomatoes, cucumbers, feta cheese, and olives in a light olive oil dressing. Perfect summer salad.', 'global', NULL, 'greek,salad,light,lunch', 'vegetarian,gluten-free,low-calorie', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000007', 'Salmon with Lemon Butter', 'Pan-seared salmon fillet with a delicate lemon butter sauce. Elegant yet simple to prepare.', 'global', NULL, 'seafood,elegant,healthy,dinner', 'gluten-free,dairy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000008', 'Mushroom Risotto', 'Creamy Arborio rice with earthy mushrooms and Parmesan. A classic Italian comfort food.', 'global', NULL, 'italian,vegetarian,comfort,dinner', 'vegetarian,gluten-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000009', 'Chicken Caesar Wrap', 'Grilled chicken, crispy romaine, and creamy Caesar dressing wrapped in a soft tortilla. Perfect lunch.', 'global', NULL, 'wrap,chicken,lunch,quick', 'dairy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000010', 'Vegetable Soup', 'Hearty mixed vegetable soup loaded with fresh veggies and aromatic herbs. Comfort in a bowl.', 'global', NULL, 'soup,vegetarian,healthy,comfort', 'vegan,gluten-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000011', 'Turkey Meatballs', 'Lean turkey meatballs with herbs and breadcrumbs, perfect with pasta or marinara sauce.', 'global', NULL, 'meatballs,italian,dinner,healthy', 'dairy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000012', 'Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing. Vegan superfood.', 'global', NULL, 'vegan,healthy,salad,lunch', 'vegan,gluten-free,vegetarian', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000013', 'Beef Stir Fry with Brown Rice', 'Quick and satisfying stir fry with tender beef and vegetables over fluffy brown rice.', 'global', NULL, 'asian,stir-fry,beef,dinner', 'dairy-free,gluten-free', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000014', 'Caprese Sandwich', 'Fresh mozzarella, tomato, and basil on crusty bread with balsamic glaze. Light Italian lunch.', 'global', NULL, 'sandwich,italian,lunch,vegetarian', 'vegetarian,dairy', 0, 0, 1, GETDATE(), GETDATE()),
('20000000-0000-0000-0000-000000000015', 'Shrimp Pasta Primavera', 'Tender shrimp and fresh seasonal vegetables tossed with pasta in light olive oil sauce. Spring on a plate.', 'global', NULL, 'seafood,pasta,light,dinner', 'dairy-free,gluten-free', 0, 0, 1, GETDATE(), GETDATE());

-- Insert recipe template items (ingredients for each template)
-- Spaghetti Carbonara (Template 1)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000036', 400, 'g'),
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000074', 200, 'g'),
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 100, 'g'),
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 4, 'piece'),
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000054', 1, 'piece'),
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000055', 0.5, 'piece');

-- Grilled Chicken (Template 2)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 'piece'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 2, 'piece'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000017', 3, 'piece'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000016', 1, 'head'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000041', 3, 'ml'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000054', 1, 'piece');

-- Thai Green Curry (Template 3)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 500, 'g'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000081', 400, 'ml'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000019', 200, 'g'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000012', 1, 'piece'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013', 3, 'clove'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000031', 1, 'piece'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000042', 2, 'ml');

-- Beef Tacos (Template 4)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 500, 'g'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000083', 8, 'piece'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000012', 1, 'piece'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000011', 2, 'piece'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000056', 1, 'ml'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000054', 1, 'piece');

-- Vegetable Stir Fry (Template 5)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000014', 2, 'piece'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000016', 200, 'g'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000020', 200, 'g'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000079', 150, 'g'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000013', 2, 'clove'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000042', 3, 'ml');

-- Greek Salad (Template 6)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000011', 4, 'piece'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000018', 1, 'piece'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000007', 200, 'g'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000041', 4, 'ml'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000048', 1, 'ml'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000054', 1, 'piece');

-- Salmon with Lemon Butter (Template 7)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 2, 'piece'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000052', 50, 'g'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000031', 2, 'piece'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000041', 2, 'ml'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000054', 1, 'piece'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000055', 0.5, 'piece');

-- Mushroom Risotto (Template 8)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000035', 300, 'g'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000020', 300, 'g'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000012', 1, 'piece'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000052', 50, 'g'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 100, 'g'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000051', 1, 'l');

-- Chicken Caesar Wrap (Template 9)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 300, 'g'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000083', 2, 'piece'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000023', 100, 'g'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000046', 4, 'ml'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 30, 'g'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000054', 1, 'piece');

-- Vegetable Soup (Template 10)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000017', 3, 'piece'),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000012', 2, 'piece'),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000011', 3, 'piece'),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000021', 2, 'piece'),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000013', 2, 'clove'),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000062', 1, 'piece');

-- Turkey Meatballs (Template 11)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000066', 500, 'g'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000037', 100, 'g'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 1, 'piece'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000013', 2, 'clove'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000062', 1, 'piece'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000044', 200, 'ml');

-- Quinoa Buddha Bowl (Template 12)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000085', 200, 'g'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000075', 200, 'g'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000016', 150, 'g'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000015', 100, 'g'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000033', 1, 'piece'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000045', 3, 'ml');

-- Beef Stir Fry with Brown Rice (Template 13)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000073', 500, 'g'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000035', 300, 'g'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000014', 2, 'piece'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000020', 200, 'g'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000042', 3, 'ml'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 1, 'clove');

-- Caprese Sandwich (Template 14)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000037', 2, 'piece'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', 150, 'g'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000011', 2, 'piece'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000061', 10, 'g'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000048', 1, 'ml'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000041', 1, 'ml');

-- Shrimp Pasta Primavera (Template 15)
INSERT INTO recipe_template_items (template_id, ingredient_id, quantity_amount, quantity_unit) VALUES
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000036', 400, 'g'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000067', 300, 'g'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000014', 2, 'piece'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000017', 2, 'piece'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 100, 'g'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000031', 1, 'piece');
