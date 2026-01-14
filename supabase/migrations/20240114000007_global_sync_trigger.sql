-- Migration: 20240114000007_global_sync_trigger.sql

-- 1. Add sync column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Create optimized sync function
CREATE OR REPLACE FUNCTION public.update_user_sync_timestamp()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine the correct user_id based on the table
    CASE TG_TABLE_NAME
        WHEN 'profiles' THEN
            -- For BEFORE UPDATE trigger on profiles, just update the column value
            IF (TG_OP = 'UPDATE') THEN
                -- Avoid infinite recursion: if only last_synced_at is updated, do nothing
                IF (OLD.last_synced_at IS DISTINCT FROM NEW.last_synced_at) THEN
                    RETURN NEW;
                END IF;
                NEW.last_synced_at := now();
                NEW.updated_at := now();
                RETURN NEW;
            END IF;
            target_user_id := NEW.id;
        WHEN 'theatre_seasons' THEN
            SELECT user_id INTO target_user_id FROM public.theatre_series WHERE id = COALESCE(NEW.series_id, OLD.series_id);
        WHEN 'routine_exercises' THEN
            SELECT user_id INTO target_user_id FROM public.routines WHERE id = COALESCE(NEW.routine_id, OLD.routine_id);
        WHEN 'workout_sets' THEN
            SELECT user_id INTO target_user_id FROM public.workout_sessions WHERE id = COALESCE(NEW.session_id, OLD.session_id);
        ELSE
            -- Default for tables with direct user_id
            IF (TG_OP = 'DELETE') THEN
                target_user_id := OLD.user_id;
            ELSE
                target_user_id := NEW.user_id;
            END IF;
    END CASE;

    -- Update the profile timestamp if user found (for non-profile tables)
    IF target_user_id IS NOT NULL AND TG_TABLE_NAME != 'profiles' THEN
        UPDATE public.profiles 
        SET last_synced_at = now(),
            updated_at = now() 
        WHERE id = target_user_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply triggers to ALL relevant tables
DO $$
DECLARE
    table_name TEXT;
    tables_to_sync TEXT[] := ARRAY[
        'subjects', 'books', 'custom_colors', 'study_sessions',
        'theatre_activities', 'theatre_movies', 'theatre_series', 'theatre_seasons',
        'royal_decrees', 'routines', 'routine_exercises', 'workout_sessions', 'workout_sets'
    ];
BEGIN
    -- Profile needs a BEFORE trigger to be efficient and avoid recursion
    DROP TRIGGER IF EXISTS tr_sync_profiles ON public.profiles;
    CREATE TRIGGER tr_sync_profiles BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp();

    FOREACH table_name IN ARRAY tables_to_sync
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_sync_%I ON public.%I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER tr_sync_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp()', table_name, table_name);
    END LOOP;
END $$;

-- 4. Ensure REALTIME is enabled for profiles
-- This is critical so the app can listen to the last_synced_at change
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
-- (Ignore if already added, RLS will still apply)
