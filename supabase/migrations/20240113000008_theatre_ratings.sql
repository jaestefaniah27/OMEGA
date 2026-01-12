-- Add rating columns to movies and seasons
ALTER TABLE public.theatre_movies 
    ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5) DEFAULT 0;

ALTER TABLE public.theatre_seasons 
    ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5) DEFAULT 0;
