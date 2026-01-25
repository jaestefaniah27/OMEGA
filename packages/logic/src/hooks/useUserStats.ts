import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { WorkoutSet } from '../database/models';

export const useUserStats = () => {
    const { profile, heroStats, loading, addGold, addXp, sync, user, database: db } = useGame();
    const [muscleFatigue, setMuscleFatigue] = useState<Record<string, number>>({});
    const [records, setRecords] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        // Simplified muscle fatigue: count sets per category in last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const sub = db.get<WorkoutSet>('workout_sets')
            .query(Q.where('created_at', Q.gt(sevenDaysAgo)))
            .observe()
            .subscribe(async (sets) => {
                const fatigue: Record<string, number> = {};
                // We'd need to join with exercises to get category, but for now let's just use placeholder
                setMuscleFatigue({ 'Pecho': 0.5, 'Espalda': 0.3 }); // Placeholder for now
            });

        // Records
        const recordsSub = db.get('workout_sets').query(Q.sortBy('weight_kg', Q.desc)).observe().subscribe(sets => {
            // Group by exercise and take max
            setRecords(sets.slice(0, 5) as any); // Just top 5 sets for now
        });

        return () => {
            sub.unsubscribe();
            recordsSub.unsubscribe();
        };
    }, [user]);

    return {
        profile,
        heroStats,
        loading,
        addGold,
        addXp,
        muscleFatigue,
        records,
        refresh: sync
    };
};
