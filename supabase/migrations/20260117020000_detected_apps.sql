CREATE TABLE IF NOT EXISTS public.detected_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    process_name TEXT NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, process_name)
);

ALTER TABLE public.detected_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own detected apps" ON public.detected_apps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detected apps" ON public.detected_apps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detected apps" ON public.detected_apps
    FOR UPDATE USING (auth.uid() = user_id);
    
-- Realtime for detected_apps (Optional, but good for instant updates)
alter publication supabase_realtime add table public.detected_apps;
