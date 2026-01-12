-- Add Saga and Saga Index to books table
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS saga TEXT,
ADD COLUMN IF NOT EXISTS saga_index INTEGER;
