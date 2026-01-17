-- OMEGA: El Alma del Héroe (Unified Progression System)
-- Unified attribute system for Mastery, Wisdom, Vigor, and Discipline.

-- 1. HERO STATS TABLE
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    mastery_xp BIGINT DEFAULT 0,
    mastery_level INTEGER DEFAULT 1,
    wisdom_xp BIGINT DEFAULT 0,
    wisdom_level INTEGER DEFAULT 1,
    vigor_xp BIGINT DEFAULT 0,
    vigor_level INTEGER DEFAULT 1,
    discipline_xp BIGINT DEFAULT 0,
    discipline_level INTEGER DEFAULT 1,
    cronolitos_balance INTEGER DEFAULT 0,
    global_level INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_stats' AND policyname = 'Users can view their own stats'
    ) THEN
        CREATE POLICY "Users can view their own stats" ON public.user_stats
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- 2. LEVEL CALCULATION LOGIC
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_val BIGINT)
RETURNS INTEGER AS $$
BEGIN
    -- Formula: Level = floor(sqrt(xp / 100)) + 1
    -- 0 XP -> Lvl 1
    -- 100 XP -> Lvl 2
    -- 400 XP -> Lvl 3
    -- 900 XP -> Lvl 4
    -- 360,000 XP (1h aura sessions * 10) -> Approx Lvl 61
    RETURN floor(sqrt(COALESCE(xp_val, 0) / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. GLOBAL LEVEL SYNC
CREATE OR REPLACE FUNCTION public.sync_global_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.global_level = floor((
        COALESCE(NEW.mastery_level, 1) + 
        COALESCE(NEW.wisdom_level, 1) + 
        COALESCE(NEW.vigor_level, 1) + 
        COALESCE(NEW.discipline_level, 1)
    ) / 4.0);
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_global_level ON public.user_stats;
CREATE TRIGGER tr_sync_global_level
    BEFORE INSERT OR UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_global_level();

-- 4. INITIALIZATION FOR ALL EXISTING USERS
INSERT INTO public.user_stats (id)
SELECT id FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- 5. ATTRIBUTE PROGRESSION TRIGGERS

-- A. WISDOM (Library Books)
CREATE OR REPLACE FUNCTION public.handle_wisdom_gain()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_gain INTEGER;
BEGIN
    -- Only when a book is newly finished
    IF (OLD.is_finished = FALSE AND NEW.is_finished = TRUE) THEN
        -- 10 XP per page + 500 bonus for finishing
        v_xp_gain := (COALESCE(NEW.total_pages, 0) * 10) + 500;
        
        INSERT INTO public.user_stats (id, wisdom_xp, wisdom_level)
        VALUES (NEW.user_id, v_xp_gain, public.calculate_level_from_xp(v_xp_gain))
        ON CONFLICT (id) DO UPDATE SET
            wisdom_xp = user_stats.wisdom_xp + v_xp_gain,
            wisdom_level = public.calculate_level_from_xp(user_stats.wisdom_xp + v_xp_gain);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_book_wisdom_gain ON public.books;
CREATE TRIGGER tr_book_wisdom_gain
    AFTER UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_wisdom_gain();

-- B. VIGOR (Workout Sessions)
CREATE OR REPLACE FUNCTION public.handle_vigor_gain()
RETURNS TRIGGER AS $$
DECLARE
    v_duration_min INTEGER;
    v_xp_gain INTEGER;
BEGIN
    -- Only when session ends
    IF (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL) THEN
        v_duration_min := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
        -- 25 XP per minute of training
        v_xp_gain := v_duration_min * 25;
        
        INSERT INTO public.user_stats (id, vigor_xp, vigor_level)
        VALUES (NEW.user_id, v_xp_gain, public.calculate_level_from_xp(v_xp_gain))
        ON CONFLICT (id) DO UPDATE SET
            vigor_xp = user_stats.vigor_xp + v_xp_gain,
            vigor_level = public.calculate_level_from_xp(user_stats.vigor_xp + v_xp_gain);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_workout_vigor_gain ON public.workout_sessions;
CREATE TRIGGER tr_workout_vigor_gain
    AFTER UPDATE ON public.workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vigor_gain();

-- C. DISCIPLINE (ritual_logs)
CREATE OR REPLACE FUNCTION public.handle_discipline_gain()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_gain INTEGER := 150; -- Heavy focus on consistency
BEGIN
    -- Only when completed flag is flipped to TRUE
    IF (OLD.completed = FALSE AND NEW.completed = TRUE) THEN
        INSERT INTO public.user_stats (id, discipline_xp, discipline_level)
        VALUES (NEW.user_id, v_xp_gain, public.calculate_level_from_xp(v_xp_gain))
        ON CONFLICT (id) DO UPDATE SET
            discipline_xp = user_stats.discipline_xp + v_xp_gain,
            discipline_level = public.calculate_level_from_xp(user_stats.discipline_xp + v_xp_gain);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ritual_discipline_gain ON public.ritual_logs;
CREATE TRIGGER tr_ritual_discipline_gain
    AFTER UPDATE ON public.ritual_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_discipline_gain();

-- D. MASTERY (Aura Channeling & Cronoliths)
CREATE OR REPLACE FUNCTION public.increment_theme_aura(p_theme_id UUID, p_amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_project_id UUID;
    v_user_id UUID;
    v_old_mastery_xp BIGINT;
    v_new_mastery_xp BIGINT;
    v_aura_threshold CONSTANT BIGINT := 36000; -- 1 Hour of focus
BEGIN
    -- 1. Gather context
    SELECT user_id, active_project_id INTO v_user_id, v_active_project_id
    FROM public.mage_themes
    WHERE id = p_theme_id;

    -- 2. Mastery XP calculation
    -- Ensure stats entry exists
    INSERT INTO public.user_stats (id) VALUES (v_user_id) ON CONFLICT (id) DO NOTHING;

    SELECT COALESCE(mastery_xp, 0) INTO v_old_mastery_xp 
    FROM public.user_stats 
    WHERE id = v_user_id;
    
    v_new_mastery_xp := v_old_mastery_xp + p_amount;

    -- 3. Cronolith Mechanic (Every 36k Aura)
    IF (v_new_mastery_xp / v_aura_threshold) > (v_old_mastery_xp / v_aura_threshold) THEN
        UPDATE public.user_stats
        SET cronolitos_balance = cronolitos_balance + 1,
            mastery_xp = mastery_xp + 2000 -- Bonus XP for Cronolith breakthrough
        WHERE id = v_user_id;
        v_new_mastery_xp := v_new_mastery_xp + 2000;
    END IF;

    -- 4. Save Final Stats
    UPDATE public.user_stats
    SET mastery_xp = v_new_mastery_xp,
        mastery_level = public.calculate_level_from_xp(v_new_mastery_xp)
    WHERE id = v_user_id;

    -- 5. Original Aura Routing Logic
    IF v_active_project_id IS NOT NULL THEN
        UPDATE public.mage_projects
        SET mana_amount = mana_amount + p_amount
        WHERE id = v_active_project_id;
    ELSE
        UPDATE public.mage_themes
        SET pending_aura = COALESCE(pending_aura, 0) + p_amount
        WHERE id = p_theme_id;
    END IF;
END;
$$;

-- 6. ENABLE REALTIME
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'user_stats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
    END IF;
END $$;
