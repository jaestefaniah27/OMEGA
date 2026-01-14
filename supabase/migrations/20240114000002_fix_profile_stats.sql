-- OMEGA: Fix Profile Stats Migration
-- Ensures all RPG columns exist in the profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_xp INTEGER DEFAULT 1000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hp_current INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hp_max INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class TEXT DEFAULT 'Aprendiz';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'Saludable';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shame_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_study_minutes INTEGER DEFAULT 0;

-- Migrate data from initial schema names if they exist
DO $$
BEGIN
    -- Migrate oro to gold
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'oro') THEN
        UPDATE public.profiles SET gold = oro WHERE gold = 0 AND oro > 0;
    END IF;

    -- Migrate xp_intelecto (or others) to current_xp as a base
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp_intelecto') THEN
        UPDATE public.profiles SET current_xp = xp_intelecto WHERE current_xp = 0 AND xp_intelecto > 0;
    END IF;
END $$;
