-- Refactor exercises table to support massive import
-- We add missing columns and ensure 'name' is unique constraint for proper upserts

-- 1. Ensure 'name' is unique
ALTER TABLE public.exercises 
ADD CONSTRAINT exercises_name_key UNIQUE (name);

-- 2. Add catalog columns
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS force TEXT,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS mechanic TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT[],
ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Comments for documentation
COMMENT ON COLUMN public.exercises.force IS 'Force type: pull, push, static';
COMMENT ON COLUMN public.exercises.level IS 'Difficulty level: beginner, intermediate, expert';
COMMENT ON COLUMN public.exercises.mechanic IS 'Mechanic type: compound, isolation';
COMMENT ON COLUMN public.exercises.equipment IS 'Equipment needed: body only, barbell, dumbbell, etc.';
COMMENT ON COLUMN public.exercises.instructions IS 'Step-by-step instructions';
COMMENT ON COLUMN public.exercises.category IS 'Exercise category: strength, stretching, etc.';
