-- Create Enums for Royal Decrees
DO $$ BEGIN
    CREATE TYPE decree_type AS ENUM ('GENERAL', 'THEATRE', 'LIBRARY', 'BARRACKS', 'CALENDAR_EVENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decree_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decree_unit AS ENUM ('MINUTES', 'PAGES', 'SESSIONS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create royal_decrees table
CREATE TABLE IF NOT EXISTS royal_decrees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type decree_type NOT NULL DEFAULT 'GENERAL',
    status decree_status NOT NULL DEFAULT 'PENDING',
    required_activity_tag TEXT,
    target_quantity INTEGER NOT NULL DEFAULT 1,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    unit decree_unit NOT NULL DEFAULT 'SESSIONS',
    due_date TIMESTAMPTZ,
    recurrence JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE royal_decrees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own decrees"
ON royal_decrees FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_royal_decrees_user_status ON royal_decrees(user_id, status);
CREATE INDEX IF NOT EXISTS idx_royal_decrees_type_tag ON royal_decrees(type, required_activity_tag) WHERE status = 'PENDING';
