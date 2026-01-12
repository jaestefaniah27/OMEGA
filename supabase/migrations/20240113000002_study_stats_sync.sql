-- OMEGA STUDY STATS SYNC
-- Automates profiles.total_study_minutes based on the sum of subjects.total_minutes_studied

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.sync_user_study_stats()
RETURNS trigger AS $$
BEGIN
    -- Update the user's profile with the new sum of study minutes
    UPDATE public.profiles
    SET total_study_minutes = (
        SELECT COALESCE(SUM(total_minutes_studied), 0)
        FROM public.subjects
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    )
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the subjects table
-- It should fire whenever a subject is added, deleted, or its time is updated
DROP TRIGGER IF EXISTS on_subject_study_time_change ON public.subjects;
CREATE TRIGGER on_subject_study_time_change
AFTER INSERT OR UPDATE OF total_minutes_studied OR DELETE
ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_study_stats();

-- 3. Run initial sync for all existing users
UPDATE public.profiles p
SET total_study_minutes = (
    SELECT COALESCE(SUM(total_minutes_studied), 0)
    FROM public.subjects
    WHERE user_id = p.id
);
