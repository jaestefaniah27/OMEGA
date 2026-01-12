-- OMEGA LIBRARY SYSTEM
-- Subjects and Study Sessions

-- 1. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8b4513', -- Default brown
    course TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    total_minutes_studied INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    mode TEXT CHECK (mode IN ('TIMER', 'STOPWATCH')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subjects" ON public.subjects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 4. REALTIME
BEGIN;
  -- Add to the existing publication if it exists, or create/recreate
  -- Note: We already have 'supabase_realtime' for profiles.
  -- To add more tables, we can drop and recreate with all tables.
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, public.subjects, public.study_sessions;
COMMIT;

-- 5. IRON WILL UPDATES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shame_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_study_minutes INTEGER DEFAULT 0;

ALTER TABLE public.study_sessions 
    ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('COMPLETED', 'ABANDONED')) DEFAULT 'COMPLETED',
    ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('EXPLORER', 'CRUSADE')) DEFAULT 'EXPLORER';
