-- Migration to add popularity flag to exercises
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.exercises.is_popular IS 'Flag to identify the most common and essential exercises for surfacing in UI.';
