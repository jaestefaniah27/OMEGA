-- tavern_water table
CREATE TABLE IF NOT EXISTS public.tavern_water (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER DEFAULT 1 NOT NULL, -- Number of glasses/jars
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.tavern_water ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water intake"
    ON public.tavern_water FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water intake"
    ON public.tavern_water FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake"
    ON public.tavern_water FOR UPDATE
    USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tavern_water;
