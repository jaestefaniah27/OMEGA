-- OMEGA: Workout Performance Optimization
-- Adding missing indexes to speed up workout-related queries and heat map generation.

-- 1. Index for workout_sessions filtering by user and date (Last 30 days)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id_started_at 
ON public.workout_sessions(user_id, started_at DESC);

-- 2. Index for workout_sets joins
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id 
ON public.workout_sets(session_id);
  
  
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id 
ON public.workout_sets(exercise_id);

-- 3. Index for routine_exercises joins
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id 
ON public.routine_exercises(routine_id);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id 
ON public.routine_exercises(exercise_id);

-- 4. Note: The get_muscle_heat_map RPC will automatically benefit from these indexes
-- as PostgreSQL's query planner uses them to avoid full table scans.
