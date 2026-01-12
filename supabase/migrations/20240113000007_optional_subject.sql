-- Make subject_id optional in study_sessions to allow theater activities
ALTER TABLE public.study_sessions 
    ALTER COLUMN subject_id DROP NOT NULL;
