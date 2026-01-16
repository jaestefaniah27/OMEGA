-- Create table for temple thoughts (Gratitude and Worries)
CREATE TABLE IF NOT EXISTS public.temple_thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('POSITIVE', 'NEGATIVE')),
    is_resolved BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for sleep registration
CREATE TABLE IF NOT EXISTS public.temple_sleep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hours FLOAT NOT NULL,
    quality TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.temple_thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_sleep ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own temple thoughts"
    ON public.temple_thoughts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sleep records"
    ON public.temple_sleep
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.temple_thoughts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.temple_sleep;

-- Mastersync Triggers
CREATE TRIGGER tr_sync_temple_thoughts AFTER INSERT OR UPDATE OR DELETE ON public.temple_thoughts
    FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp();

CREATE TRIGGER tr_sync_temple_sleep AFTER INSERT OR UPDATE OR DELETE ON public.temple_sleep
    FOR EACH ROW EXECUTE FUNCTION public.update_user_sync_timestamp();
