-- Add active_project_id to mage_themes
ALTER TABLE public.mage_themes 
ADD COLUMN IF NOT EXISTS active_project_id UUID REFERENCES public.mage_projects(id) ON DELETE SET NULL;

-- Update the RPC to route aura intelligently
CREATE OR REPLACE FUNCTION public.increment_theme_aura(p_theme_id UUID, p_amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_project_id UUID;
BEGIN
    -- Check if there is an active project for this theme
    SELECT active_project_id INTO v_active_project_id
    FROM public.mage_themes
    WHERE id = p_theme_id;

    IF v_active_project_id IS NOT NULL THEN
        -- Route directly to the project
        UPDATE public.mage_projects
        SET mana_amount = mana_amount + p_amount
        WHERE id = v_active_project_id;
    ELSE
        -- Route to pending_aura buffer
        UPDATE public.mage_themes
        SET pending_aura = COALESCE(pending_aura, 0) + p_amount
        WHERE id = p_theme_id;
    END IF;
END;
$$;
