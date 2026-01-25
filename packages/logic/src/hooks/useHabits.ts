import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { DailyRitual, RitualLog } from '../database/models';

export const useHabits = () => {
    const { user, database: db, sync } = useGame();
    const [rituals, setRituals] = useState<DailyRitual[]>([]);
    const [todayLogs, setTodayLogs] = useState<RitualLog[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!user) return;

        const ritualSub = db.get<DailyRitual>('daily_rituals')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(records => {
                setRituals(records);
            });

        const logSub = db.get<RitualLog>('ritual_logs')
            .query(Q.where('user_id', user.id), Q.where('date', today))
            .observe()
            .subscribe(records => {
                setTodayLogs(records);
                setLoading(false);
            });

        return () => {
            ritualSub.unsubscribe();
            logSub.unsubscribe();
        };
    }, [user]);

    // Ensure logs exist for today
    useEffect(() => {
        if (!user || loading || rituals.length === 0) return;

        const checkAndCreateLogs = async () => {
            const missingRituals = rituals.filter(r => !todayLogs.some(l => l.ritual_id === r.id));
            if (missingRituals.length > 0) {
                await db.write(async () => {
                    for (const r of missingRituals) {
                        await db.get<RitualLog>('ritual_logs').create(log => {
                            log.user_id = user.id;
                            log.ritual_id = r.id;
                            log.date = today;
                            log.completed = false;
                        });
                    }
                });
            }
        };
        checkAndCreateLogs();
    }, [user, rituals, todayLogs, loading]);

    const toggleHabit = async (logId: string, completed: boolean) => {
        await db.write(async () => {
            const log = await db.get<RitualLog>('ritual_logs').find(logId);
            await log.update(l => {
                l.completed = completed;
            });

            if (completed) {
                const ritual = await db.get<DailyRitual>('daily_rituals').find(log.ritual_id);
                await ritual.update(r => {
                    r.current_streak = (r.current_streak || 0) + 1;
                });
            }
        });
    };

    const addRitual = async (name: string, type: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<DailyRitual>('daily_rituals').create(r => {
                r.user_id = user.id;
                r.name = name;
                r.activity_type = type;
                r.current_streak = 0;
            });
        });
    };

    const deleteRitual = async (id: string) => {
        await db.write(async () => {
            const ritual = await db.get<DailyRitual>('daily_rituals').find(id);
            await ritual.markAsDeleted();
            // Also delete logs
            const logs = await db.get<RitualLog>('ritual_logs').query(Q.where('ritual_id', id)).fetch();
            for (const log of logs) {
                await log.markAsDeleted();
            }
        });
    };

    return {
        rituals,
        todayLogs: todayLogs.map(log => ({
            ...log,
            definition: rituals.find(r => r.id === log.ritual_id)
        })),
        loading,
        toggleHabit,
        addRitual,
        deleteRitual,
        refresh: sync
    };
};
