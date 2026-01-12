-- Add Custom Colors Table
CREATE TABLE custom_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  hex_code TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_colors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own custom colors" ON custom_colors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom colors" ON custom_colors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom colors" ON custom_colors FOR DELETE USING (auth.uid() = user_id);
