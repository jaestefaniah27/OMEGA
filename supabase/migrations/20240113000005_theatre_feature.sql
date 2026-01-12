-- OMEGA THEATRE: ACTIVITIES, MOVIES & SERIES
-- This migration adds support for tracking non-book hobbies and entertainment.

-- 1. ACTIVITIES TABLE (Camerinos)
CREATE TABLE IF NOT EXISTS public.theatre_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MOVIES TABLE (Taquilla)
CREATE TABLE IF NOT EXISTS public.theatre_movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    director TEXT,
    saga TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SERIES TABLE (Taquilla)
CREATE TABLE IF NOT EXISTS public.theatre_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SEASONS TABLE (Sub-menu of Series)
CREATE TABLE IF NOT EXISTS public.theatre_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID REFERENCES public.theatre_series(id) ON DELETE CASCADE NOT NULL,
    season_number INTEGER NOT NULL,
    episodes_count INTEGER,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. UPDATE STUDY SESSIONS
-- Link sessions to activities to track "Time & Days"
ALTER TABLE public.study_sessions 
    ADD COLUMN IF NOT EXISTS activity_id UUID REFERENCES public.theatre_activities(id) ON DELETE SET NULL;

-- 6. RLS POLICIES
ALTER TABLE public.theatre_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatre_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatre_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatre_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activities" ON public.theatre_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own movies" ON public.theatre_movies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own series" ON public.theatre_series FOR ALL USING (auth.uid() = user_id);
-- Seasons are managed via series ownership (implicit in UI, but policy-wise we need series_id join or owner check)
CREATE POLICY "Users can manage their own seasons" ON public.theatre_seasons FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.theatre_series WHERE id = series_id AND user_id = auth.uid()));

-- 7. REALTIME PUBLICATION UPDATE
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime_theatre;
  CREATE PUBLICATION supabase_realtime_theatre FOR TABLE 
    public.theatre_activities, 
    public.theatre_movies, 
    public.theatre_series, 
    public.theatre_seasons;
COMMIT;
