import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/supabase';

export const useUserStats = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let channel: any;

        const fetchProfileData = async (userId: string) => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                if (fetchError) throw fetchError;
                setProfile(data);

                // Suscribirse a cambios en tiempo real filtrando por el ID
                channel = supabase
                    .channel(`profile_${userId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'profiles',
                            filter: `id=eq.${userId}`
                        },
                        (payload: any) => {
                            if (payload.new) {
                                setProfile(prev => ({ ...(prev as Profile), ...payload.new }));
                            }
                        }
                    )
                    .subscribe();

            } catch (err: any) {
                console.error('Error fetching profile:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                fetchProfileData(user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        };

        checkUser();

        // Escuchar cambios de auth
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                fetchProfileData(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                if (channel) {
                    supabase.removeChannel(channel);
                    channel = null;
                }
            }
        });

        return () => {
            if (channel) supabase.removeChannel(channel);
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { profile, loading, error };
};
