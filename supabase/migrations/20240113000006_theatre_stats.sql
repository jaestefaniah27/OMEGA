-- Add explicit tracking columns to theatre_activities
ALTER TABLE public.theatre_activities 
    ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS days_count INTEGER DEFAULT 0;

-- Function to increment stats (optional but cleaner for atomic updates)
CREATE OR REPLACE FUNCTION public.increment_theatre_activity_stats(activity_id UUID, minutes INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.theatre_activities
    SET total_minutes = total_minutes + minutes,
        days_count = (
            SELECT count(distinct created_at::date)
            FROM public.study_sessions
            WHERE activity_id = $1
        )
    WHERE id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
