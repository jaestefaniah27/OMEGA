import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { MuscleFatigue } from '../types/supabase';

export const useUserStats = () => {
    const { profile, user } = useGame();
    const [muscleFatigue, setMuscleFatigue] = useState<MuscleFatigue>({});
    const [loadingStats, setLoadingStats] = useState(false);

    const fetchMuscleFatigue = async () => {
        if (!user) return;
        setLoadingStats(true);
        try {
            const { data, error } = await supabase.rpc('get_muscle_heat_map', {
                user_uuid: user.id
            });
            if (error) throw error;
            setMuscleFatigue(data || {});
        } catch (e) {
            console.error('Error fetching muscle fatigue:', e);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMuscleFatigue();
        }
    }, [user]);

    return {
        profile,
        muscleFatigue,
        loading: (!profile && !!user) || loadingStats,
        refreshStats: fetchMuscleFatigue,
        error: null
    };
};
