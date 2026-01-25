import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { TavernWater } from '../database/models';

export const useTavern = () => {
    const { user, database: db, sync } = useGame();
    const [waterRecords, setWaterRecords] = useState<TavernWater[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!user) return;
        const sub = db.get<TavernWater>('tavern_water')
            .query(Q.where('user_id', user.id), Q.where('date', today))
            .observe()
            .subscribe(records => {
                setWaterRecords(records);
                setLoading(false);
            });
        return () => sub.unsubscribe();
    }, [user]);

    const todayWater = useMemo(() => {
        return waterRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
    }, [waterRecords]);

    const recommendedWater = 8;
    const isGoalReached = todayWater >= recommendedWater;

    const registerWater = async (amount: number = 1) => {
        if (!user) return;
        await db.write(async () => {
            const existing = waterRecords[0];
            if (existing) {
                await existing.update(r => {
                    r.amount = (r.amount || 0) + amount;
                });
            } else {
                await db.get<TavernWater>('tavern_water').create(r => {
                    r.user_id = user.id;
                    r.amount = amount;
                    r.date = today;
                });
            }
        });
    };

    return {
        todayWater,
        recommendedWater,
        isGoalReached,
        registerWater,
        loading,
        refresh: sync
    };
};
