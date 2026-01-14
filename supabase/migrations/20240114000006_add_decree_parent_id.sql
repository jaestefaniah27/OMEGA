-- Add parent_id to royal_decrees for recurring instances
ALTER TABLE royal_decrees 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES royal_decrees(id) ON DELETE CASCADE;

-- Add index for performance when fetching series
CREATE INDEX IF NOT EXISTS idx_royal_decrees_parent_id ON royal_decrees(parent_id);
