-- Create exercises table if it doesn't exist (safety check)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new biomechanics columns
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS primary_muscles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS intensity_factor DECIMAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS bodyweight_factor DECIMAL DEFAULT 0.0;

-- Comment on columns for documentation
COMMENT ON COLUMN public.exercises.primary_muscles IS 'Array of primary muscle identifiers impacted by the exercise';
COMMENT ON COLUMN public.exercises.secondary_muscles IS 'Array of secondary muscle identifiers impacted by the exercise';
COMMENT ON COLUMN public.exercises.intensity_factor IS 'Multiplier for systemic stress volume (default 1.0)';
COMMENT ON COLUMN public.exercises.bodyweight_factor IS 'Percentage of bodyweight (0.0-1.0) to add to the load';
