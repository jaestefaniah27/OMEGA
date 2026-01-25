import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { TavernWater } from '../database/models';

export const useTavern = () => {
    const { user, database: db, sync } = useGame();
    const [waterRecords, setWaterRecords] = useState<TavernWater[]>([]);
    const [loading, setLoading] = useState(true);

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        if (!user) return;
        console.log('[useTavern] Setting up observer for user:', user.id, 'date:', today);
        const sub = db.get<TavernWater>('tavern_water')
            .query(Q.where('user_id', user.id), Q.where('date', today))
            .observe()
            .subscribe(records => {
                console.log('[useTavern] Observer fired, records:', records.length, records.map(r => ({ id: r.id, amount: r.amount })));
                setWaterRecords(records);
                setLoading(false);
            });
        return () => {
            console.log('[useTavern] Cleaning up observer');
            sub.unsubscribe();
        };
    }, [user, db, today]);

    const todayWater = useMemo(() => {
        const total = waterRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
        console.log('[useTavern] Calculating todayWater:', total, 'from', waterRecords.length, 'records');
        return total;
    }, [waterRecords]);

    const recommendedWater = 8;
    const isGoalReached = todayWater >= recommendedWater;

    const registerWater = async (amount: number = 1) => {
        if (!user) return;
        await db.write(async () => {
            const records = await db.get<TavernWater>('tavern_water')
                .query(Q.where('user_id', user.id), Q.where('date', today))
                .fetch();

            const existing = records[0];
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
        // Sync will happen automatically in the background
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
