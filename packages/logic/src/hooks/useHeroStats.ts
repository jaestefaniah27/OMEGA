import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HeroStats } from '../types/supabase';

/**
 * useHeroStats: Hook to access and subscribe to the hero's progression system.
 * This hook unifies Mastery, Wisdom, Vigor, and Discipline stats.
 */
export const useHeroStats = (userId: string | undefined) => {
    const [stats, setStats] = useState<HeroStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        if (!userId) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('user_stats')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) {
                // If it doesn't exist, it will be created by triggers or first gain
                // but we should probably handle the case where it's not initialized yet
                if (fetchError.code === 'PGRST116') {
                    setStats(null);
                } else {
                    throw fetchError;
                }
            } else {
                setStats(data as HeroStats);
            }
        } catch (err: any) {
            console.error('Error fetching hero stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;

        fetchStats();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`hero_stats_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_stats',
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    console.log('Hero Stats Change Received:', payload.new);
                    setStats(payload.new as HeroStats);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats
    };
};
