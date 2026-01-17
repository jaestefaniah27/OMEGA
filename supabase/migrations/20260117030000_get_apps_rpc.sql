-- Secure RPC to get detected apps for a specific user
-- This allows the desktop worker (using anon key) to read the list of apps
-- without needing full RLS read access to everything.

CREATE OR REPLACE FUNCTION public.get_detected_apps(target_user_id UUID)
RETURNS TABLE (process_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
BEGIN
    RETURN QUERY
    SELECT da.process_name
    FROM public.detected_apps da
    WHERE da.user_id = target_user_id;
END;
$$;
