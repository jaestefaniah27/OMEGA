-- OMEGA LIBRARY 2.0: BOOKS & DUAL MODE

-- 1. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    total_pages INTEGER NOT NULL DEFAULT 0,
    current_page INTEGER DEFAULT 0,
    cover_color TEXT DEFAULT '#8b4513', -- Default leather brown
    is_finished BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. UPDATE STUDY SESSIONS
-- Expand sessions to be able to reference EITHER a subject OR a book (or both, theoretically, but UI handles one)
ALTER TABLE public.study_sessions 
    ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES public.books(id) ON DELETE SET NULL;

-- 3. RLS POLICIES FOR BOOKS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own books" ON public.books
    FOR ALL USING (auth.uid() = user_id);

-- 4. REALTIME PUBLICATION UPDATE
-- Re-create publication to include the new 'books' table
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, public.subjects, public.study_sessions, public.books;
COMMIT;
