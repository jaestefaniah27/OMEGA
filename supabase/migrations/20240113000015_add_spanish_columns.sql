-- Add Spanish translation columns to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS instructions_es TEXT[];

COMMENT ON COLUMN public.exercises.name_es IS 'Spanish name of the exercise';
COMMENT ON COLUMN public.exercises.instructions_es IS 'Spanish step-by-step instructions';
