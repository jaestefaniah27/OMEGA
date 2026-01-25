-- OMEGA: Timestamp & Sync Robustness Fix
-- This migration standardizes updated_at across all tables and fixes the pull_changes RPC.

-- 1. UTILITY FUNCTION: Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. STANDARDIZE TABLES (Add created_at and updated_at if missing, fix column names)
DO $$
DECLARE
    t TEXT;
    tables_to_fix TEXT[] := ARRAY[
        'profiles', 'user_stats', 'subjects', 'books', 'study_sessions', 'routines', 
        'workout_sessions', 'workout_sets', 'royal_decrees', 
        'temple_thoughts', 'temple_sleep', 'mage_projects', 'mage_themes',
        'theatre_activities', 'theatre_movies', 'theatre_series', 'theatre_seasons',
        'tavern_water', 'daily_rituals', 'ritual_logs', 'routine_exercises'
    ];
BEGIN
    -- Special fix for daily_rituals: Rename title to name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_rituals' AND column_name = 'title') THEN
        ALTER TABLE public.daily_rituals RENAME COLUMN title TO name;
    END IF;

    -- Special fix for mage_projects: Rename mana_amount to current_aura (to match schema.ts)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mage_projects' AND column_name = 'mana_amount') THEN
        ALTER TABLE public.mage_projects RENAME COLUMN mana_amount TO current_aura;
    END IF;
    ALTER TABLE public.mage_projects ADD COLUMN IF NOT EXISTS target_aura INTEGER DEFAULT 1000;

    -- Special fix for user_stats: Add missing columns
    ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS cronolitos_balance INTEGER DEFAULT 0;

    -- Special fix for study_sessions: Add notes
    ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS notes TEXT;

    -- Loop to add standard columns and triggers
    FOREACH t IN ARRAY tables_to_fix
    LOOP
        -- Add created_at column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'created_at') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now()', t);
        END IF;
        
        -- Add updated_at column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()', t);
        END IF;
        
        -- Apply handle_updated_at trigger
        EXECUTE format('DROP TRIGGER IF EXISTS tr_handle_updated_at_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER tr_handle_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
    END LOOP;
END $$;

-- 3. CONVERT RITUALS AND LOGS TO UUID (Non-destructive mapping)
DO $$
BEGIN
    -- Check if we need to convert daily_rituals
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'daily_rituals' AND column_name = 'id') = 'bigint' THEN
        
        -- 1. Create temporary UUID columns
        ALTER TABLE public.daily_rituals ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();
        ALTER TABLE public.ritual_logs ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();
        ALTER TABLE public.ritual_logs ADD COLUMN IF NOT EXISTS uuid_ritual_id UUID;

        -- 2. Map existing relationships
        UPDATE public.ritual_logs rl 
        SET uuid_ritual_id = dr.uuid_id 
        FROM public.daily_rituals dr 
        WHERE rl.ritual_id = dr.id;

        -- 3. Drop constraints and old columns
        ALTER TABLE public.ritual_logs DROP CONSTRAINT IF EXISTS ritual_logs_ritual_id_fkey;
        
        -- Remove identity and defaults
        ALTER TABLE public.ritual_logs ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.daily_rituals ALTER COLUMN id DROP IDENTITY IF EXISTS;
        
        -- Drop old Primary Keys (Postgres requires this before dropping columns used in PK)
        ALTER TABLE public.ritual_logs DROP CONSTRAINT IF EXISTS ritual_logs_pkey;
        ALTER TABLE public.daily_rituals DROP CONSTRAINT IF EXISTS daily_rituals_pkey;

        -- 4. Swap columns
        ALTER TABLE public.ritual_logs DROP COLUMN id;
        ALTER TABLE public.ritual_logs DROP COLUMN ritual_id;
        ALTER TABLE public.daily_rituals DROP COLUMN id;

        ALTER TABLE public.daily_rituals RENAME COLUMN uuid_id TO id;
        ALTER TABLE public.ritual_logs RENAME COLUMN uuid_id TO id;
        ALTER TABLE public.ritual_logs RENAME COLUMN uuid_ritual_id TO ritual_id;

        -- 5. Restore Primary Keys and Foreign Keys
        ALTER TABLE public.daily_rituals ADD PRIMARY KEY (id);
        ALTER TABLE public.ritual_logs ADD PRIMARY KEY (id);
        
        -- Delete any orphaned logs that couldn't be mapped (safety)
        DELETE FROM public.ritual_logs WHERE ritual_id IS NULL;
        ALTER TABLE public.ritual_logs ALTER COLUMN ritual_id SET NOT NULL;
        
        ALTER TABLE public.ritual_logs ADD CONSTRAINT ritual_logs_ritual_id_fkey 
            FOREIGN KEY (ritual_id) REFERENCES daily_rituals(id) ON DELETE CASCADE;
            
    END IF;
END $$;

-- 4. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
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
            'created', COALESCE((SELECT jsonb_agg(t) FROM public.profiles t WHERE t.id = v_user_id AND (last_pulled_at IS NULL OR t.created_at > last_pulled_at)), '[]'::jsonb),
            'updated', COALESCE((SELECT jsonb_agg(t) FROM public.profiles t WHERE t.id = v_user_id AND last_pulled_at IS NOT NULL AND t.updated_at > last_pulled_at AND t.created_at <= last_pulled_at), '[]'::jsonb),
            'deleted', '[]'::jsonb
        )
    );

    -- user_stats (special case: id is user_id)
    v_changes := jsonb_set(v_changes, '{user_stats}', 
        jsonb_build_object(
            'created', COALESCE((SELECT jsonb_agg(t) FROM public.user_stats t WHERE t.id = v_user_id AND (last_pulled_at IS NULL OR t.created_at > last_pulled_at)), '[]'::jsonb),
            'updated', COALESCE((SELECT jsonb_agg(t) FROM public.user_stats t WHERE t.id = v_user_id AND last_pulled_at IS NOT NULL AND t.updated_at > last_pulled_at AND t.created_at <= last_pulled_at), '[]'::jsonb),
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
                WHERE r.user_id = v_user_id AND (last_pulled_at IS NULL OR t.created_at > last_pulled_at)
            ), '[]'::jsonb),
            'updated', COALESCE((
                SELECT jsonb_agg(t) FROM public.routine_exercises t 
                JOIN public.routines r ON t.routine_id = r.id 
                WHERE r.user_id = v_user_id AND last_pulled_at IS NOT NULL AND t.updated_at > last_pulled_at AND t.created_at <= last_pulled_at
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
