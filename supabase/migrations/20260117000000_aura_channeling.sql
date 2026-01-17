-- worker_commands table
-- Used for async communication between App (Client) and Desktop (Worker)
CREATE TABLE IF NOT EXISTS public.worker_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    command_type TEXT NOT NULL, -- e.g., 'GET_APPS'
    status TEXT DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    payload JSONB DEFAULT '{}'::jsonb, -- Input parameters
    response JSONB DEFAULT '{}'::jsonb, -- Output data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- app_aura_mappings table
-- Rules connecting an App process to a Domain
CREATE TABLE IF NOT EXISTS public.app_aura_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    process_name TEXT NOT NULL,
    theme_id UUID REFERENCES public.mage_themes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, process_name)
);

-- Add pending_aura to mage_themes
ALTER TABLE public.mage_themes ADD COLUMN IF NOT EXISTS pending_aura BIGINT DEFAULT 0;

-- RLS for worker_commands
ALTER TABLE public.worker_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own worker commands"
    ON public.worker_commands FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own worker commands"
    ON public.worker_commands FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own worker commands"
    ON public.worker_commands FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own worker commands"
    ON public.worker_commands FOR DELETE
    USING (auth.uid() = user_id);

-- RLS for app_aura_mappings
ALTER TABLE public.app_aura_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own app aura mappings"
    ON public.app_aura_mappings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app aura mappings"
    ON public.app_aura_mappings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app aura mappings"
    ON public.app_aura_mappings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app aura mappings"
    ON public.app_aura_mappings FOR DELETE
    USING (auth.uid() = user_id);

-- Realtime Configuration
ALTER TABLE public.worker_commands REPLICA IDENTITY FULL;
-- app_aura_mappings doesn't strictly need realtime for the protocol, but good for sync if multiple devices
ALTER TABLE public.app_aura_mappings REPLICA IDENTITY FULL;

-- Add to publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'worker_commands'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.worker_commands;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'app_aura_mappings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_aura_mappings;
    END IF;
END $$;
