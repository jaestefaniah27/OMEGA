-- Secure RPC to get app aura mappings for a specific user
-- Allows worker to read rules without full RLS access

CREATE OR REPLACE FUNCTION public.get_app_mappings(target_user_id UUID)
RETURNS TABLE (process_name TEXT, theme_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT am.process_name, am.theme_id
    FROM public.app_aura_mappings am
    WHERE am.user_id = target_user_id;
END;
$$;
