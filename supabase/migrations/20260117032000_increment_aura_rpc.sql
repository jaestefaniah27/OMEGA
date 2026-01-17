-- Secure RPC to increment pending aura for a theme.
-- Allows the worker to update aura without full RLS write access.

CREATE OR REPLACE FUNCTION public.increment_theme_aura(p_theme_id UUID, p_amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.mage_themes
    SET pending_aura = COALESCE(pending_aura, 0) + p_amount
    WHERE id = p_theme_id;
END;
$$;
