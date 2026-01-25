import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { database } from '../database';
import { SyncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import {
    Profile,
    UserStats,
    Subject,
    Book,
    RoyalDecree,
    DailyRitual,
    RitualLog,
    TheatreActivity
} from '../database/models';

interface GameContextType {
    database: typeof database;
    sync: () => Promise<void>;
    user: any | null;
    profile: Profile | null;
    heroStats: UserStats | null;
    loading: boolean;
    refresh: () => Promise<void>;
    addGold: (amount: number) => Promise<void>;
    addXp: (amount: number) => Promise<void>;
    forceMemoryCleanup: () => void;
    // Compatibility Layers
    library: {
        subjects: Subject[];
        books: Book[];
    };
    castle: {
        decrees: RoyalDecree[];
        addDecree: (data: any) => Promise<void>;
        updateDecree: (id: string, updates: any) => Promise<void>;
        deleteDecree: (id: string) => Promise<void>;
        loading: boolean;
    };
    habits: {
        todayLogs: any[];
        toggleHabit: (id: string, completed: boolean) => Promise<void>;
        loading: boolean;
    };
    theatre: {
        activities: TheatreActivity[];
    };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [heroStats, setHeroStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Compatibility states
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [decrees, setDecrees] = useState<RoyalDecree[]>([]);
    const [rituals, setRituals] = useState<DailyRitual[]>([]);
    const [ritualLogs, setRitualLogs] = useState<RitualLog[]>([]);
    const [theatreActivities, setTheatreActivities] = useState<TheatreActivity[]>([]);

    const sync = async () => {
        try {
            await SyncService.sync();
        } catch (e) {
            console.error('Sync failed:', e);
        }
    };

    // Observer for Profile and UserStats
    useEffect(() => {
        if (!user) return;

        const profileSub = database.get<Profile>('profiles')
            .query(Q.where('id', user.id))
            .observe()
            .subscribe(records => {
                if (records[0]) setProfile(records[0]);
            });

        const statsSub = database.get<UserStats>('user_stats')
            .query(Q.where('id', user.id))
            .observe()
            .subscribe(records => {
                if (records[0]) setHeroStats(records[0]);
            });

        // Compatibility observers
        const subSub = database.get<Subject>('subjects').query(Q.where('user_id', user.id)).observe().subscribe(setSubjects);
        const bookSub = database.get<Book>('books').query(Q.where('user_id', user.id)).observe().subscribe(setBooks);
        const decreeSub = database.get<RoyalDecree>('royal_decrees').query(Q.where('user_id', user.id)).observe().subscribe(setDecrees);
        const ritualSub = database.get<DailyRitual>('daily_rituals').query(Q.where('user_id', user.id)).observe().subscribe(setRituals);

        const today = new Date().toISOString().split('T')[0];
        const logSub = database.get<RitualLog>('ritual_logs')
            .query(Q.where('user_id', user.id), Q.where('date', today))
            .observe()
            .subscribe(setRitualLogs);

        const theatreSub = database.get<TheatreActivity>('theatre_activities').query(Q.where('user_id', user.id)).observe().subscribe(setTheatreActivities);

        return () => {
            profileSub.unsubscribe();
            statsSub.unsubscribe();
            subSub.unsubscribe();
            bookSub.unsubscribe();
            decreeSub.unsubscribe();
            ritualSub.unsubscribe();
            logSub.unsubscribe();
            theatreSub.unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                sync();
            } else {
                setUser(null);
                setProfile(null);
                setHeroStats(null);
            }
            setLoading(false);
        });

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') sync();
        });

        return () => {
            authListener.subscription.unsubscribe();
            subscription.remove();
        };
    }, []);

    const addGold = async (amount: number) => {
        if (!user || !profile) return;
        await database.write(async () => {
            await profile.update(p => {
                p.gold = (p.gold || 0) + amount;
            });
        });
    };

    const addXp = async (amount: number) => {
        if (!user || !profile) return;
        await database.write(async () => {
            await profile.update(p => {
                p.current_xp = (p.current_xp || 0) + amount;
                if (p.current_xp >= p.max_xp) {
                    p.level += 1;
                    p.current_xp -= p.max_xp;
                    p.max_xp = Math.floor(p.max_xp * 1.2);
                }
            });
        });
    };

    const forceMemoryCleanup = () => {
        console.log('🧹 [CLEANUP] Memory cleanup triggered (compatibility mode)');
    };

    // Mapping today's logs for Castle compatibility
    const todayLogs = useMemo(() => {
        return rituals.map(ritual => {
            const log = ritualLogs.find(l => l.ritual_id === ritual.id);
            return {
                id: log?.id || `temp-${ritual.id}`,
                definition: ritual,
                completed: log?.completed || false,
                current_value: 0, // Simplified for now
                target_value: 1
            };
        });
    }, [rituals, ritualLogs]);

    const addDecree = async (data: any) => {
        if (!user) return;
        await database.write(async () => {
            await database.get<RoyalDecree>('royal_decrees').create(d => {
                d.user_id = user.id;
                d.title = data.title;
                d.type = data.type || 'GENERAL';
                d.status = 'PENDING';
                d.target_quantity = data.target_quantity || 1;
                d.current_quantity = 0;
                d.due_date = data.due_date;
            });
        });
    };

    const updateDecree = async (id: string, updates: any) => {
        await database.write(async () => {
            const decree = await database.get<RoyalDecree>('royal_decrees').find(id);
            await decree.update(d => {
                Object.assign(d, updates);
            });
        });
    };

    const deleteDecree = async (id: string) => {
        await database.write(async () => {
            const decree = await database.get<RoyalDecree>('royal_decrees').find(id);
            await decree.markAsDeleted();
        });
    };

    const toggleHabit = async (ritualId: string, completed: boolean) => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        await database.write(async () => {
            const logs = await database.get<RitualLog>('ritual_logs')
                .query(Q.where('ritual_id', ritualId), Q.where('date', today))
                .fetch();

            if (logs.length > 0) {
                await logs[0].update(l => {
                    l.completed = completed;
                });
            } else {
                await database.get<RitualLog>('ritual_logs').create(l => {
                    l.user_id = user.id;
                    l.ritual_id = ritualId;
                    l.date = today;
                    l.completed = completed;
                });
            }
        });
    };

    const value: GameContextType = {
        database,
        sync,
        user,
        profile,
        heroStats,
        loading,
        refresh: sync,
        addGold,
        addXp,
        forceMemoryCleanup,
        library: { subjects, books },
        castle: {
            decrees,
            loading: false,
            addDecree,
            updateDecree,
            deleteDecree,
        },
        habits: {
            todayLogs,
            toggleHabit,
            loading: false
        },
        theatre: { activities: theatreActivities },
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
