-- OMEGA: Desktop Activity Aggregation

-- 1. RAW ACTIVITIES (Optional, for high-res data if needed)
CREATE TABLE IF NOT EXISTS public.computer_activities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_name TEXT NOT NULL,
    duration_seconds INT,
    state TEXT CHECK (state IN ('focus', 'background')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.computer_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own activities" ON public.computer_activities
    FOR SELECT USING (auth.uid() = user_id);

-- 2. DAILY/HOURLY SUMMARY (Aggregated)
CREATE TABLE IF NOT EXISTS public.daily_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_name TEXT NOT NULL,
    total_focus_seconds INT DEFAULT 0,
    total_background_seconds INT DEFAULT 0,
    activity_date DATE DEFAULT CURRENT_DATE,
    activity_hour INT, -- 0-23
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, app_name, activity_date, activity_hour)
);

ALTER TABLE public.daily_activity_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own summaries" ON public.daily_activity_summary
    FOR SELECT USING (auth.uid() = user_id);

-- 3. UPSERT RPC FOR AGGREGATION
CREATE OR REPLACE FUNCTION public.upsert_activity_summary(
    p_user_id UUID,
    p_app_name TEXT,
    p_focus_secs INT,
    p_bg_secs INT,
    p_hour INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.daily_activity_summary 
        (user_id, app_name, total_focus_seconds, total_background_seconds, activity_hour)
    VALUES 
        (p_user_id, p_app_name, p_focus_secs, p_bg_secs, p_hour)
    ON CONFLICT (user_id, app_name, activity_date, activity_hour) DO UPDATE SET
        total_focus_seconds = daily_activity_summary.total_focus_seconds + EXCLUDED.total_focus_seconds,
        total_background_seconds = daily_activity_summary.total_background_seconds + EXCLUDED.total_background_seconds,
        created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
