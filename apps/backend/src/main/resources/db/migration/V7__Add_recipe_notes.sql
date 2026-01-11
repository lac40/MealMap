-- V7__Add_recipe_notes.sql
-- Add notes column for recipe markdown notes (owner-private)

ALTER TABLE recipes
ADD notes NVARCHAR(MAX) NULL;
