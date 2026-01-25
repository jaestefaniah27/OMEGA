-- OMEGA: WatermelonDB Sync Engine Migration (Fixed & Expanded)

-- 1. DELETED RECORDS TRACKING
CREATE TABLE IF NOT EXISTS public.deleted_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.deleted_records ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own deletions' AND tablename = 'deleted_records') THEN
        CREATE POLICY "Users can see their own deletions" ON public.deleted_records
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. DELETE TRACKING TRIGGER
CREATE OR REPLACE FUNCTION public.track_deletions()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.deleted_records (table_name, record_id, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, COALESCE(auth.uid(), (OLD.user_id)::UUID));
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY DELETE TRIGGERS
DO $$
DECLARE
    table_name TEXT;
    tables_to_track TEXT[] := ARRAY[
        'subjects', 'books', 'study_sessions', 'routines', 
        'workout_sessions', 'workout_sets', 'royal_decrees', 
        'temple_thoughts', 'temple_sleep', 'mage_projects', 'mage_themes',
        'theatre_activities', 'theatre_movies', 'theatre_series', 'theatre_seasons',
        'tavern_water', 'daily_rituals', 'ritual_logs', 'routine_exercises'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_track
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_track_delete_%I ON public.%I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER tr_track_delete_%I AFTER DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.track_deletions()', table_name, table_name);
    END LOOP;
END $$;

-- 4. PULL_CHANGES RPC
CREATE OR REPLACE FUNCTION public.pull_changes(last_pulled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_timestamp TIMESTAMP WITH TIME ZONE := now();
    v_changes JSONB := '{}'::JSONB;
    v_table_changes JSONB;
    v_table TEXT;
    v_query_created TEXT;
    v_query_updated TEXT;
    v_query_deleted TEXT;
    v_tables TEXT[] := ARRAY[
        'subjects', 'books', 'study_sessions', 'routines', 
        'workout_sessions', 'royal_decrees', 
        'temple_thoughts', 'temple_sleep', 'mage_projects', 'mage_themes',
        'theatre_activities', 'theatre_movies', 'theatre_series',
        'tavern_water', 'daily_rituals', 'ritual_logs'
    ];
BEGIN
    -- profiles (special case: id is user_id)
    v_changes := jsonb_set(v_changes, '{profiles}', 
        jsonb_build_object(
            'created', COALESCE((SELECT jsonb_agg(t) FROM public.profiles t WHERE t.id = v_user_id AND (last_pulled_at IS NULL OR t.updated_at > last_pulled_at)), '[]'::jsonb),
            'updated', '[]'::jsonb,
            'deleted', '[]'::jsonb
        )
    );

    -- user_stats (special case: id is user_id)
    v_changes := jsonb_set(v_changes, '{user_stats}', 
        jsonb_build_object(
            'created', COALESCE((SELECT jsonb_agg(t) FROM public.user_stats t WHERE t.id = v_user_id AND (last_pulled_at IS NULL OR t.updated_at > last_pulled_at)), '[]'::jsonb),
            'updated', '[]'::jsonb,
            'deleted', '[]'::jsonb
        )
    );

    -- Loop for standard user_id tables
    FOREACH v_table IN ARRAY v_tables
    LOOP
        EXECUTE format('
            SELECT jsonb_build_object(
                ''created'', COALESCE((SELECT jsonb_agg(t) FROM public.%I t WHERE t.user_id = %L AND (%L IS NULL OR t.created_at > %L)), ''[]''::jsonb),
                ''updated'', COALESCE((SELECT jsonb_agg(t) FROM public.%I t WHERE t.user_id = %L AND %L IS NOT NULL AND t.updated_at > %L AND t.created_at <= %L), ''[]''::jsonb),
                ''deleted'', COALESCE((SELECT jsonb_agg(record_id) FROM public.deleted_records WHERE user_id = %L AND table_name = %L AND deleted_at > %L), ''[]''::jsonb)
            )', v_table, v_user_id, last_pulled_at, last_pulled_at, v_table, v_user_id, last_pulled_at, last_pulled_at, last_pulled_at, v_user_id, v_table, last_pulled_at) 
        INTO v_table_changes;
        v_changes := jsonb_set(v_changes, array[v_table], v_table_changes);
    END LOOP;

    -- manual logic for tables without direct user_id but relation
    -- workout_sets (via workout_sessions)
    v_changes := jsonb_set(v_changes, '{workout_sets}', 
        jsonb_build_object(
            'created', COALESCE((
                SELECT jsonb_agg(t) FROM public.workout_sets t 
                JOIN public.workout_sessions s ON t.session_id = s.id 
                WHERE s.user_id = v_user_id AND (last_pulled_at IS NULL OR t.created_at > last_pulled_at)
            ), '[]'::jsonb),
            'updated', COALESCE((
                SELECT jsonb_agg(t) FROM public.workout_sets t 
                JOIN public.workout_sessions s ON t.session_id = s.id 
                WHERE s.user_id = v_user_id AND last_pulled_at IS NOT NULL AND t.updated_at > last_pulled_at AND t.created_at <= last_pulled_at
            ), '[]'::jsonb),
            'deleted', COALESCE((SELECT jsonb_agg(record_id) FROM public.deleted_records WHERE user_id = v_user_id AND table_name = 'workout_sets' AND deleted_at > last_pulled_at), '[]'::jsonb)
        )
    );

    -- routine_exercises (via routines)
    v_changes := jsonb_set(v_changes, '{routine_exercises}', 
        jsonb_build_object(
            'created', COALESCE((
                SELECT jsonb_agg(t) FROM public.routine_exercises t 
                JOIN public.routines r ON t.routine_id = r.id 
                WHERE r.user_id = v_user_id AND (last_pulled_at IS NULL OR r.created_at > last_pulled_at)
            ), '[]'::jsonb),
            'updated', COALESCE((
                SELECT jsonb_agg(t) FROM public.routine_exercises t 
                JOIN public.routines r ON t.routine_id = r.id 
                WHERE r.user_id = v_user_id AND last_pulled_at IS NOT NULL AND (t.id::text > '') -- Simplified for catalog
            ), '[]'::jsonb),
            'deleted', COALESCE((SELECT jsonb_agg(record_id) FROM public.deleted_records WHERE user_id = v_user_id AND table_name = 'routine_exercises' AND deleted_at > last_pulled_at), '[]'::jsonb)
        )
    );

    -- theatre_seasons (via theatre_series)
    v_changes := jsonb_set(v_changes, '{theatre_seasons}', 
        jsonb_build_object(
            'created', COALESCE((
                SELECT jsonb_agg(t) FROM public.theatre_seasons t 
                JOIN public.theatre_series s ON t.series_id = s.id 
                WHERE s.user_id = v_user_id AND (last_pulled_at IS NULL OR t.created_at > last_pulled_at)
            ), '[]'::jsonb),
            'updated', COALESCE((
                SELECT jsonb_agg(t) FROM public.theatre_seasons t 
                JOIN public.theatre_series s ON t.series_id = s.id 
                WHERE s.user_id = v_user_id AND last_pulled_at IS NOT NULL AND t.updated_at > last_pulled_at AND t.created_at <= last_pulled_at
            ), '[]'::jsonb),
            'deleted', COALESCE((SELECT jsonb_agg(record_id) FROM public.deleted_records WHERE user_id = v_user_id AND table_name = 'theatre_seasons' AND deleted_at > last_pulled_at), '[]'::jsonb)
        )
    );

    -- exercises (global catalog)
    v_changes := jsonb_set(v_changes, '{exercises}', 
        jsonb_build_object(
            'created', COALESCE((SELECT jsonb_agg(t) FROM public.exercises t WHERE last_pulled_at IS NULL), '[]'::jsonb),
            'updated', '[]'::jsonb,
            'deleted', '[]'::jsonb
        )
    );

    RETURN jsonb_build_object(
        'changes', v_changes,
        'timestamp', (EXTRACT(EPOCH FROM v_timestamp) * 1000)::BIGINT
    );
END;
$$;
