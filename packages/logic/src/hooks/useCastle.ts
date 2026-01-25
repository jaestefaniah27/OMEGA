import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { RoyalDecree } from '../database/models';

export const useCastle = () => {
    const { user, database: db, sync } = useGame();
    const [decrees, setDecrees] = useState<RoyalDecree[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const sub = db.get<RoyalDecree>('royal_decrees')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(records => {
                setDecrees(records);
                setLoading(false);
            });

        return () => sub.unsubscribe();
    }, [user]);

    const addDecree = async (decree: any) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<RoyalDecree>('royal_decrees').create(d => {
                d.user_id = user.id;
                d.title = decree.title;
                d.description = decree.description;
                d.type = decree.type;
                d.target_quantity = decree.target_quantity;
                d.current_quantity = 0;
                d.unit = decree.unit;
                d.status = 'PENDING';
                d.due_date = decree.due_date;
            });
        });
    };

    const updateDecree = async (id: string, updates: any) => {
        await db.write(async () => {
            const decree = await db.get<RoyalDecree>('royal_decrees').find(id);
            await decree.update(d => {
                Object.assign(d, updates);
            });
        });
    };

    const deleteDecree = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<RoyalDecree>('royal_decrees').find(id);
            await record.markAsDeleted();
        });
    };

    return {
        decrees,
        activeDecrees: decrees.filter(d => d.status === 'PENDING'),
        completedDecrees: decrees.filter(d => d.status === 'COMPLETED'),
        loading,
        addDecree,
        updateDecree,
        deleteDecree,
        updateDecreeProgress,
        refresh: sync
    };
};
