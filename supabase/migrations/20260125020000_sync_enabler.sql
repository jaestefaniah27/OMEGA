-- OMEGA: Sync Enabler (Updated At Triggers)

-- 1. Helper Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add Column and Trigger to all tables
DO $$
DECLARE
    t_name TEXT;
    tables TEXT[] := ARRAY[
        'subjects', 'books', 'study_sessions', 'routines', 
        'workout_sessions', 'workout_sets', 'royal_decrees', 
        'temple_thoughts', 'temple_sleep', 'mage_projects', 'mage_themes',
        'tavern_water', 'daily_rituals', 'ritual_logs'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        -- Add Column
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', t_name);
        
        -- Add Trigger
        EXECUTE format('DROP TRIGGER IF EXISTS tr_set_updated_at ON public.%I', t_name);
        EXECUTE format('CREATE TRIGGER tr_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t_name);
    END LOOP;
END $$;
