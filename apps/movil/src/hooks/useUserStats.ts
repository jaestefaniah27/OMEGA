import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { MuscleFatigue } from '../types/supabase';

export const useUserStats = () => {
    const { profile, user } = useGame();
    const [muscleFatigue, setMuscleFatigue] = useState<MuscleFatigue>({});
    const [records, setRecords] = useState<any[]>([]);
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

    const fetchRecords = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('get_personal_records', {
                user_uuid: user.id
            });
            if (error) throw error;
            setRecords(data || []);
        } catch (e) {
            console.error('Error fetching records:', e);
        }
    };

    const refreshAll = () => {
        fetchMuscleFatigue();
        fetchRecords();
    };

    useEffect(() => {
        if (user) {
            refreshAll();
        }
    }, [user]);

    return {
        profile,
        muscleFatigue,
        records,
        loading: (!profile && !!user) || loadingStats,
        refreshStats: refreshAll,
        error: null
    };
};
