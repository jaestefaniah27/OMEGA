-- mage_themes table
CREATE TABLE IF NOT EXISTS public.mage_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL, -- Icon name
    color TEXT NOT NULL, -- Hex code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- mage_projects table
CREATE TABLE IF NOT EXISTS public.mage_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scope TEXT, -- Legacy/Optional
    theme_id UUID REFERENCES public.mage_themes(id) ON DELETE SET NULL,
    mana_amount INTEGER DEFAULT 0 NOT NULL, 
    status TEXT DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for mage_themes
ALTER TABLE public.mage_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mage themes"
    ON public.mage_themes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mage themes"
    ON public.mage_themes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mage themes"
    ON public.mage_themes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mage themes"
    ON public.mage_themes FOR DELETE
    USING (auth.uid() = user_id);

-- RLS
ALTER TABLE public.mage_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mage projects"
    ON public.mage_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mage projects"
    ON public.mage_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mage projects"
    ON public.mage_projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mage projects"
    ON public.mage_projects FOR DELETE
    USING (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.mage_themes REPLICA IDENTITY FULL;
ALTER TABLE public.mage_projects REPLICA IDENTITY FULL;

-- Add triggers for global sync (Master Sync system)
-- This ensures that when a project or theme changes, the profile's last_synced_at 
-- is updated, triggering other devices to reload.
CREATE TRIGGER tr_sync_mage_themes AFTER INSERT OR UPDATE OR DELETE ON public.mage_themes 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp();

CREATE TRIGGER tr_sync_mage_projects AFTER INSERT OR UPDATE OR DELETE ON public.mage_projects 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp();

-- Securely add to publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'mage_projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mage_projects;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'mage_themes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mage_themes;
    END IF;
END $$;
