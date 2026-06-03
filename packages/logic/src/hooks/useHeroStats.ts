import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from '../queries/keys';
import { HeroStats } from '../types/supabase';

/**
 * useHeroStats: alma del héroe (Maestría, Sabiduría, Vigor, Disciplina).
 * Migrado a React Query: una sola query ['heroStats'] + realtime que
 * actualiza la caché. Unifica la doble lectura de user_stats.
 */
export const useHeroStats = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.heroStats,
        enabled: !!userId,
        queryFn: async (): Promise<HeroStats | null> => {
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') return null; // aún no inicializado
                throw error;
            }
            return data as HeroStats;
        },
    });

    // Realtime: empuja cambios de user_stats directamente a la caché.
    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel(`hero_stats_${userId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'user_stats', filter: `id=eq.${userId}` },
                (payload) => queryClient.setQueryData(qk.heroStats, payload.new as HeroStats),
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userId, queryClient]);

    return {
        stats: query.data ?? null,
        loading: query.isLoading,
        error: query.error ? (query.error as Error).message : null,
        refresh: () => queryClient.invalidateQueries({ queryKey: qk.heroStats }),
    };
};
