import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/supabase';

const TEST_USER_ID = '903cf1c9-8d37-4a9b-b228-418c44dc91fa';

export const useUserStats = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                // TEMPORAL: Usar ID hardcodeado mientras no hay Login
                const userId = TEST_USER_ID;

                // Consultamos el perfil (usamos maybeSingle para no fallar si no existe)
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                console.log('Supabase Query Result:', { data, error: fetchError });

                if (fetchError) throw fetchError;
                setProfile(data);
                if (!data) console.warn('Aviso: No se encontró ningún perfil con el ID:', userId);
            } catch (err: any) {
                console.error('Error fetching profile:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Suscribirse a cambios en tiempo real filtrando por el ID hardcodeado
        const channel = supabase
            .channel('profile_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${TEST_USER_ID}`
                },
                (payload) => {
                    setProfile(payload.new as Profile);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { profile, loading, error };
};
