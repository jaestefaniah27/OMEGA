-- OMEGA: Advanced Training System Migration (FIXED)
-- Arquitecto de Bases de Datos Senior

-- Limpieza preventiva de tablas nuevas (NO de la tabla exercises)
DROP TABLE IF EXISTS public.workout_sets CASCADE;
DROP TABLE IF EXISTS public.workout_sessions CASCADE;
DROP TABLE IF EXISTS public.routine_exercises CASCADE;
DROP TABLE IF EXISTS public.routines CASCADE;

-- 1. RUTINAS
CREATE TABLE public.routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EJERCICIOS DE LA RUTINA (Relación N:M)
CREATE TABLE public.routine_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    target_sets INTEGER DEFAULT 3,
    target_reps INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SESIONES DE ENTRENAMIENTO
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    bodyweight DECIMAL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SERIES DE ENTRENAMIENTO
CREATE TABLE public.workout_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL NOT NULL,
    reps INTEGER NOT NULL,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    type TEXT CHECK (type IN ('warmup', 'normal', 'failure')) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can manage their own routines" ON public.routines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own routine_exercises" ON public.routine_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.routines 
            WHERE routines.id = routine_exercises.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own workout_sessions" ON public.workout_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout_sets" ON public.workout_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions 
            WHERE workout_sessions.id = workout_sets.session_id 
            AND workout_sessions.user_id = auth.uid()
        )
    );

-- 5. RPC: get_muscle_heat_map
CREATE OR REPLACE FUNCTION public.get_muscle_heat_map(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH recent_sets AS (
        SELECT 
            ws.weight_kg,
            ws.reps,
            e.intensity_factor,
            e.muscle_heads
        FROM public.workout_sets ws
        JOIN public.workout_sessions s ON ws.session_id = s.id
        JOIN public.exercises e ON ws.exercise_id = e.id
        WHERE s.user_id = user_uuid
          AND s.started_at >= (now() - INTERVAL '30 days')
          AND ws.type != 'warmup'
    ),
    expanded_heads AS (
        SELECT 
            (head->>'muscle')::text as muscle,
            (head->>'head')::text as head_name,
            (head->>'activation')::decimal as activation,
            weight_kg,
            reps,
            intensity_factor
        FROM recent_sets,
        LATERAL jsonb_array_elements(muscle_heads) as head
    ),
    muscle_scores AS (
        SELECT 
            muscle,
            SUM(weight_kg * reps * intensity_factor * activation) as total_fatigue
        FROM expanded_heads
        GROUP BY muscle
    )
    SELECT jsonb_object_agg(muscle, total_fatigue) INTO result FROM muscle_scores;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 6. RPC: get_personal_records
CREATE OR REPLACE FUNCTION public.get_personal_records(user_uuid UUID)
RETURNS TABLE (
    exercise_id UUID,
    exercise_name TEXT,
    max_weight DECIMAL,
    achieved_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT DISTINCT ON (ws.exercise_id)
        ws.exercise_id,
        e.name_es as exercise_name,
        ws.weight_kg as max_weight,
        ws.created_at as achieved_at
    FROM public.workout_sets ws
    JOIN public.workout_sessions s ON ws.session_id = s.id
    JOIN public.exercises e ON ws.exercise_id = e.id
    WHERE s.user_id = user_uuid
    ORDER BY ws.exercise_id, ws.weight_kg DESC, ws.created_at ASC;
$$;
