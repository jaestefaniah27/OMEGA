-- OMEGA: Add Exams to Subjects
-- Adds a JSONB column to store exams and a grade field for the subject itself

ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS exams JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS final_grade DECIMAL DEFAULT NULL;

-- Description:
-- Each exam in the JSONB array will have:
-- {
--   "id": UUID,
--   "title": TEXT,
--   "date": TIMESTAMP,
--   "time": TEXT (optional),
--   "place": TEXT (optional),
--   "weight": DECIMAL (contribution factor, 0-100),
--   "grade": DECIMAL (0-10),
--   "is_completed": BOOLEAN,
--   "decree_id": UUID (link to the royal decree)
-- }
