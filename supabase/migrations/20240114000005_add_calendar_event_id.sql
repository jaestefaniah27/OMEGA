DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royal_decrees' AND column_name = 'calendar_event_id') THEN
        ALTER TABLE royal_decrees ADD COLUMN calendar_event_id TEXT;
        CREATE INDEX idx_royal_decrees_calendar_event_id ON royal_decrees(calendar_event_id);
    END IF;
END $$;
