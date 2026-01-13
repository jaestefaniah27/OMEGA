-- Migration to add user favorites and muscle granularity
CREATE TABLE IF NOT EXISTS public.user_exercise_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, exercise_id)
);

-- Enable RLS for favorites
ALTER TABLE public.user_exercise_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
    ON public.user_exercise_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON public.user_exercise_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON public.user_exercise_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Add muscle_heads to exercises for granular detail
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS muscle_heads JSONB DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.exercises.muscle_heads IS 'Stores granular muscle head activation details (e.g., [{"muscle": "Bíceps", "head": "Larga", "activation": 0.8}])';
