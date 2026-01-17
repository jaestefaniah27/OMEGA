CREATE OR REPLACE FUNCTION upsert_detected_apps(payload JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.detected_apps (user_id, process_name, last_seen)
    SELECT
        (x->>'user_id')::uuid,
        x->>'process_name',
        (x->>'last_seen')::timestamp with time zone
    FROM jsonb_array_elements(payload) AS x
    ON CONFLICT (user_id, process_name) 
    DO UPDATE SET last_seen = EXCLUDED.last_seen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
