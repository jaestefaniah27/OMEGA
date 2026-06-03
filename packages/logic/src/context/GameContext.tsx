import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo } from 'react';
import { AppState, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../queries/queryClient';
import { qk } from '../queries/keys';
import {
    Subject,
    Book,
    CustomColor,
    TheatreActivity,
    TheatreMovie,
    TheatreSeries,
    TheatreSeason,
    Profile,
    Routine,
    RoutineExercise,
    Exercise,
    MuscleFatigue,
    PersonalRecord,
    RoyalDecree,
    RoutineWithExercises,
    DecreeType,
    DecreeStatus,
    DecreeUnit,
    TempleThought,
    TempleSleep,
    ThoughtType,
    TavernWater,
    MageProject,
    MageTheme,
    MageAppMapping,
    DailyRitual,
    RitualLog,
    HeroStats
} from '../types/supabase';
import { useCalendar } from '../hooks/useCalendar';
import { useHabits } from '../hooks/useHabits';
import { showGlobalToast } from './ToastContext';

export interface WorkoutHistoryItem {
    id: string;
    date: string;
    routine: string;
    duration: string;
    tonnage: string;
}

const GAME_STATE_STORAGE_KEY = '@omega_game_state_v1';

interface GameContextType {
    // --- LIBRARY DATA ---
    library: {
        subjects: Subject[];
        books: Book[];
        customColors: CustomColor[];
        bookStats: Record<string, number>;
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addSubject: (name: string, color: string, course?: string) => Promise<any>;
        updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
        addBook: (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => Promise<any>;
        updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
        saveCustomColor: (hex_code: string, name?: string) => Promise<any>;
    };

    // --- THEATRE DATA ---
    theatre: {
        activities: TheatreActivity[];
        movies: TheatreMovie[];
        series: (TheatreSeries & { seasons: TheatreSeason[] })[];
        activityStats: Record<string, { totalMinutes: number, daysCount: number }>;
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addActivity: (name: string) => Promise<any>;
        updateActivity: (id: string, name: string) => Promise<void>;
        addMovie: (title: string, director?: string, saga?: string, comment?: string, rating?: number) => Promise<any>;
        updateMovie: (id: string, updates: Partial<TheatreMovie>) => Promise<void>;
        addSeries: (title: string) => Promise<any>;
        updateSeries: (id: string, title: string) => Promise<void>;
        addSeason: (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating?: number) => Promise<void>;
        updateSeason: (id: string, updates: Partial<TheatreSeason>) => Promise<void>;
    };

    // --- CASTLE DATA ---
    castle: {
        decrees: RoyalDecree[];
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addDecree: (decree: Partial<RoyalDecree> & { calendar_export?: boolean }) => Promise<any>;
        updateDecree: (id: string, updates: Partial<RoyalDecree>) => Promise<void>;
        deleteDecree: (id: string) => Promise<void>;
        checkDecreeProgress: (type: DecreeType, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => Promise<void>;
    };


    // --- CALENDAR INTEGRATION ---
    calendar: {
        calendars: any[];
        status: any;
        requestPermission: () => Promise<any>;
        importCalendarId: string | null;
        exportCalendarId: string | null;
        isSyncing: boolean;
        saveSettings: (importId: string | null, exportId: string | null) => Promise<void>;
        syncNativeEventsToDecrees: () => Promise<void>;
        registerBackgroundFetch: () => Promise<void>;
    };

    // --- HABITS (RITUALS) ---
    habits: {
        rituals: DailyRitual[];
        todayLogs: RitualLog[];
        loading: boolean;
        refresh: () => Promise<void>;
        toggleHabit: (logId: number, completed: boolean) => Promise<void>;
        addRitual: (ritual: Partial<DailyRitual>) => Promise<any>;
        checkHabitProgress: (type: string, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => Promise<{ totalXp: number; totalGold: number }>;
    };

    // --- GLOBAL ---
    user: any | null;
    profile: Profile | null;
    heroStats: HeroStats | null;

    // --- RPCs ---
    addGold: (amount: number) => Promise<void>;
    addXp: (amount: number) => Promise<void>;
    fetchAll: () => Promise<void>;
    checkDecreeProgress: (type: DecreeType, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
    // User & Profile
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    // Library State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [customColors, setCustomColors] = useState<CustomColor[]>([]);
    const [bookStats, setBookStats] = useState<Record<string, number>>({});
    const [libraryLoading, setLibraryLoading] = useState(true);

    // Theatre State
    const [activities, setActivities] = useState<TheatreActivity[]>([]);
    const [movies, setMovies] = useState<TheatreMovie[]>([]);
    const [series, setSeries] = useState<(TheatreSeries & { seasons: TheatreSeason[] })[]>([]);
    const [activityStats, setActivityStats] = useState<Record<string, { totalMinutes: number, daysCount: number }>>({});
    const [theatreLoading, setTheatreLoading] = useState(true);

    // Barracks State
    const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
    const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
    const [muscleFatigue, setMuscleFatigue] = useState<MuscleFatigue>({});
    const [records, setRecords] = useState<PersonalRecord[]>([]);
    const [barracksLoading, setBarracksLoading] = useState(true);

    // Castle State
    const [decrees, setDecrees] = useState<RoyalDecree[]>([]);
    const [castleLoading, setCastleLoading] = useState(true);

    // Temple State
    const [thoughts, setThoughts] = useState<TempleThought[]>([]);
    const [sleepRecords, setSleepRecords] = useState<TempleSleep[]>([]);
    const [templeLoading, setTempleLoading] = useState(true);

    // Tavern State
    const [waterRecords, setWaterRecords] = useState<TavernWater[]>([]);
    const [tavernLoading, setTavernLoading] = useState(true);

    const [mageProjects, setMageProjects] = useState<MageProject[]>([]);
    const [mageThemes, setMageThemes] = useState<MageTheme[]>([]);
    const [mageAppMappings, setMageAppMappings] = useState<MageAppMapping[]>([]);
    const [unhandledAuraByTheme, setUnhandledAuraByTheme] = useState<Record<string, number>>({});
    const [mageLoading, setMageLoading] = useState(true);

    const [heroStats, setHeroStats] = useState<HeroStats | null>(null);

    // Initial Load Flag to prevent double-fetch issues or hydration flicker
    const isHydrated = useRef(false);
    const lastProcessedSync = useRef<string | null>(null);

    // OPTIMIZATION: Debounce ref for AsyncStorage writes
    const saveDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);


    const {
        rituals: habitRituals,
        todayLogs: habitLogs,
        loading: habitsLoading,
        refresh: refreshHabits,
        toggleHabit,
        addRitual,
        checkHabitProgress: checkHabitProgressInternal
    } = useHabits(user?.id);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (saveDebounceRef.current) {
                clearTimeout(saveDebounceRef.current);
            }
        };
    }, []);

    // --- PERSISTENCE HELPERS ---
    const loadFromLocal = async () => {
        try {
            const json = await AsyncStorage.getItem(GAME_STATE_STORAGE_KEY);
            if (json) {
                const data = JSON.parse(json);
                const { lib, theat, prof } = data;

                if (lib) {
                    setSubjects(lib.subjects || []);
                    setBooks(lib.books || []);
                    setCustomColors(lib.customColors || []);
                    setBookStats(lib.bookStats || {});
                    setLibraryLoading(false); // Immediate interaction
                }
                if (theat) {
                    setActivities(theat.activities || []);
                    setMovies(theat.movies || []);
                    setSeries(theat.series || []);
                    setActivityStats(theat.activityStats || {});
                    setTheatreLoading(false); // Immediate interaction
                }
                if (data.barracks) {
                    setRoutines(data.barracks.routines || []);
                    setHistory(data.barracks.history || []);
                    setMuscleFatigue(data.barracks.muscleFatigue || {});
                    setRecords(data.barracks.records || []);
                    setBarracksLoading(false);
                }
                if (prof) {
                    setProfile(prof);
                }
                if (data.castle) {
                    setDecrees(data.castle.decrees || []);
                    setCastleLoading(false);
                }
                if (data.temple) {
                    setThoughts(data.temple.thoughts || []);
                    setSleepRecords(data.temple.sleepRecords || []);
                    setTempleLoading(false);
                }
                if (data.tavern) {
                    setWaterRecords(data.tavern.waterRecords || []);
                    setTavernLoading(false);
                }
                if (data.mageTower) {
                    setMageProjects(data.mageTower.projects || []);
                    setMageThemes(data.mageTower.themes || []);
                    setMageLoading(false);
                }
                isHydrated.current = true;
            }
        } catch (e) {
            console.error('Offline Mode: Failed to load local data', e);
        }
    };

    const saveToLocal = async (
        libData: { subjects: any[], books: any[], customColors: any[], bookStats: any },
        theatData: { activities: any[], movies: any[], series: any[], activityStats: any },
        barracksData: { routines: any[], history: any[], muscleFatigue: any, records: any },
        castleData: { decrees: RoyalDecree[] },
        templeData: { thoughts: TempleThought[], sleepRecords: TempleSleep[] },
        tavernData: { waterRecords: TavernWater[] },
        mageData: { projects: MageProject[], themes: MageTheme[] },
        profData: any
    ) => {
        // NO-OP: el god-dump de estado completo a AsyncStorage en cada mutación
        // era la causa #1 de la lentitud progresiva (JSON.stringify de todo el
        // estado, creciendo sin tope, en el hilo principal). La persistencia
        // ahora la cubre el persister de React Query, acotada y en background.
        // Se conserva la firma para no tocar los ~20 call sites (código muerto
        // de dominios ya migrados a React Query).
    };

    // OPTIMIZATION: Debounced wrapper for saveToLocal
    const debouncedSaveToLocal = (
        libData: { subjects: any[], books: any[], customColors: any[], bookStats: any },
        theatData: { activities: any[], movies: any[], series: any[], activityStats: any },
        barracksData: { routines: any[], history: any[], muscleFatigue: any, records: any },
        castleData: { decrees: RoyalDecree[] },
        templeData: { thoughts: TempleThought[], sleepRecords: TempleSleep[] },
        tavernData: { waterRecords: TavernWater[] },
        mageData: { projects: MageProject[], themes: MageTheme[] },
        profData: any
    ) => {
        if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
        saveDebounceRef.current = setTimeout(() => {
            saveToLocal(libData, theatData, barracksData, castleData, templeData, tavernData, mageData, profData);
        }, 3000); // Wait 3 seconds before saving
    };

    const clearState = async () => {
        try {
            // Reset States
            setUser(null);
            setProfile(null);
            setSubjects([]);
            setBooks([]);
            setCustomColors([]);
            setBookStats({});
            setActivities([]);
            setMovies([]);
            setSeries([]);
            setActivityStats({});
            setRoutines([]);
            setHistory([]);
            setMuscleFatigue({});
            setRecords([]);
            setDecrees([]);

            // Clear Storage
            await AsyncStorage.removeItem(GAME_STATE_STORAGE_KEY);
            await AsyncStorage.removeItem('@omega_active_workout_v2');

            console.log('GameContext: State cleared successfully');
        } catch (e) {
            console.error('GameContext: Failed to clear state', e);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const checkDecreeProgress = async (type: DecreeType, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => {
        // Also check habit progress
        const habitRewards = await checkHabitProgressInternal(type, tag, amount, durationMinutes, genericTag);
        if (habitRewards?.totalXp > 0) await addXp(habitRewards.totalXp);
        if (habitRewards?.totalGold > 0) await addGold(habitRewards.totalGold);

        if (!user || !decrees) return;

        const todayStr = new Date().toISOString().split('T')[0];

        // Filter valid decrees for this event
        const pendingDecrees = decrees.filter(d => {
            const matchesType = d.status === 'PENDING' &&
                d.type === type &&
                (!d.required_activity_tag || d.required_activity_tag === tag || (genericTag && d.required_activity_tag === genericTag));

            if (!matchesType) return false;

            // If it has a due_date, it MUST match Today to be processed
            if (d.due_date) {
                const dueStr = new Date(d.due_date).toISOString().split('T')[0];
                return dueStr === todayStr;
            }

            // If no due_date, it's a general task that can be completed anytime
            return true;
        });

        let updated = false;

        for (const decree of pendingDecrees) {
            const minTime = decree.recurrence?.min_time || 0;
            const isTimeBased = decree.unit === 'MINUTES';

            // 1. Requirements Check
            if (minTime > 0 && durationMinutes !== undefined && durationMinutes < minTime) {
                continue; // Too short to count
            }

            // 2. Increment Logic
            // If unit is MINUTES, we add the duration. If SESSIONS, we add the fixed amount (usually 1).
            const increment = isTimeBased ? (durationMinutes || 0) : amount;

            if (increment <= 0) continue;

            const newQuantity = (decree.current_quantity || 0) + increment;
            const isCompleted = newQuantity >= (decree.target_quantity || 1);

            const updates: Partial<RoyalDecree> = {
                current_quantity: newQuantity,
                status: isCompleted ? 'COMPLETED' : 'PENDING',
                completed_at: isCompleted ? new Date().toISOString() : null
            };

            const { error } = await supabase
                .from('royal_decrees')
                .update(updates)
                .eq('id', decree.id);

            if (!error) {
                updated = true;
                if (isCompleted) {
                    await addXp(50);
                    await addGold(10);

                    // Special logic for EXAM decrees: auto-complete the exam in the subject
                    if (decree.type === 'EXAM') {
                        const subjectWithExam = subjects.find(s =>
                            (s.exams || []).some(ex => ex.decree_id === decree.id)
                        );
                        if (subjectWithExam) {
                            const updatedExams = subjectWithExam.exams.map(ex =>
                                ex.decree_id === decree.id ? { ...ex, is_completed: true } : ex
                            );
                            await updateSubject(subjectWithExam.id, { exams: updatedExams });
                        }
                    }
                }
            }
        }

        if (updated) {
            await fetchAll();
        }
    };

    // --- FETCH ---
    const fetchAll = async () => {
        try {
            if (!isHydrated.current) {
                setLibraryLoading(true);
                setTheatreLoading(true);
            }

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            if (!currentUser) return;

            // PARALLEL FETCH (solo dominios que aún viven en GameContext;
            // barracks/temple/tavern/mage se sirven desde React Query).
            const [
                subjectsRes, booksRes, colorsRes, sessionsRes,
                actRes, movRes, serRes, seasRes,
                profileRes, decreesRes, statsRes,
            ] = await Promise.all([
                supabase.from('subjects').select('*').order('created_at', { ascending: false }),
                supabase.from('books').select('*').order('created_at', { ascending: false }),
                supabase.from('custom_colors').select('*').order('created_at', { ascending: false }),
                supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', currentUser.id).not('book_id', 'is', null),
                supabase.from('theatre_activities').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_movies').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_series').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_seasons').select('*').order('season_number', { ascending: true }),
                supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
                supabase.from('royal_decrees').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                supabase.from('user_stats').select('*').eq('id', currentUser.id).single(),
            ]);

            const subData = subjectsRes.data || [];
            const bookData = booksRes.data || [];
            const colData = colorsRes.data || [];
            const sessData = sessionsRes.data || [];
            const actData = actRes.data || [];
            const movData = movRes.data || [];
            const serData = serRes.data || [];
            const seasData = seasRes.data || [];
            const profData = profileRes.data;
            const decreeData = decreesRes.data || [];
            const statsData = statsRes.data;

            // --- PROCESS LIBRARY ---
            const bStats: Record<string, number> = {};
            sessData.forEach((s: any) => {
                if (s.book_id) {
                    bStats[s.book_id] = (bStats[s.book_id] || 0) + s.duration_minutes;
                }
            });

            setSubjects(subData);
            setBooks(bookData);
            setCustomColors(colData);
            setBookStats(bStats);

            // --- PROCESS THEATRE ---
            // OPTIMIZATION: Limit seasons per series to last 10
            const seriesWithSeasons = serData.map((s: any) => ({
                ...s,
                seasons: seasData
                    .filter((season: any) => season.series_id === s.id)
                    .slice(-10) // Only keep last 10 seasons
            }));

            const tStats: Record<string, { totalMinutes: number, daysCount: number }> = {};
            actData.forEach((act: any) => {
                tStats[act.id] = {
                    totalMinutes: act.total_minutes || 0,
                    daysCount: act.days_count || 0
                };
            });

            setActivities(actData);
            setMovies(movData);
            setSeries(seriesWithSeasons);
            setActivityStats(tStats);

            // --- PROCESS PROFILE ---
            if (profData) {
                setProfile(profData as Profile);
            }

            if (statsData) {
                setHeroStats(statsData as HeroStats);
            }

            // --- PROCESS CASTLE ---
            setDecrees(decreeData);

            if (profData?.last_synced_at) {
                lastProcessedSync.current = profData.last_synced_at;
            }

            // --- AUTO-FAIL MAINTENANCE ---
            // If any pending decree is more than 24h past its due_date, mark it as FAILED
            const now = new Date();
            const gracePeriod = 24 * 60 * 60 * 1000;
            const overdue = decreeData.filter(d =>
                d.status === 'PENDING' &&
                d.due_date &&
                (now.getTime() - new Date(d.due_date).getTime()) > gracePeriod
            );

            if (overdue.length > 0) {
                const ids = overdue.map(d => d.id);
                const { error: failError } = await supabase
                    .from('royal_decrees')
                    .update({ status: 'FAILED' })
                    .in('id', ids);

                if (!failError) {
                    // Re-fetch once to get updated statuses
                    const { data: refreshedDecrees } = await supabase
                        .from('royal_decrees')
                        .select('*')
                        .eq('user_id', currentUser.id)
                        .order('created_at', { ascending: false });

                    if (refreshedDecrees) {
                        setDecrees(refreshedDecrees);
                    }
                }
            }

            // --- HABITS ---
            await refreshHabits(true);

        } catch (error) {
            console.error('GameContext: Fetch Error', error);
        } finally {
            setLibraryLoading(false);
            setTheatreLoading(false);
            setCastleLoading(false);
            isHydrated.current = true;
        }
    };

    // --- INIT ---
    useEffect(() => {
        // 1. Fetch Remote (Background Sync). La persistencia offline la cubre
        //    el persister de React Query; ya no hay god-dump de AsyncStorage.
        fetchAll();

        // 2. Refresh on Focus (AppState). El poll de 2min se eliminó:
        //    React Query (staleTime) + realtime cubren el frescor.
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                fetchAll();
            }
        });

        // 6. Auth State Changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`GameContext: Auth Event -> ${event}`);

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user);
                    // Force refresh on initial load or sign in
                    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                        fetchAll();
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                const { data: { session: activeSession } } = await supabase.auth.getSession();
                if (!activeSession) {
                    console.log('GameContext: Executing clearState due to verified SIGNED_OUT');
                    clearState();
                } else {
                    console.log('GameContext: Ignored SIGNED_OUT event - active session still prevails.');
                }
            }
        });

        return () => {
            subscription.remove();
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 5. Realtime Subscription (Optimized Master Sync)
    // This effect re-runs when 'user' changes, ensuring we are subscribed to the correct profile.
    useEffect(() => {
        if (!user) return;

        console.log(`GameContext: Setting up Realtime sync for user: ${user.id}`);

        const channel = supabase.channel(`sync_${user.id}`)
            .on('postgres_changes',
                {
                    event: '*', // Listen to INSERT/UPDATE to be safe
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload: any) => {
                    const newSync = payload.new?.last_synced_at || payload.new?.updated_at;

                    if (newSync) {
                        const newTime = new Date(newSync).getTime();
                        const lastTime = lastProcessedSync.current ? new Date(lastProcessedSync.current).getTime() : 0;

                        // Only fetch if the new timestamp is physically different/newer
                        if (newTime !== lastTime) {
                            console.log(`GameContext: Sync triggered (${newTime} vs ${lastTime})`);
                            fetchAll();
                        }
                    }
                }
            )
            // Aura de la Torre del Mago (worker de escritorio). Mage vive en
            // React Query -> invalidación dirigida en vez de fetchAll global.
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'mage_themes',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: qk.mage });
                }
            )
            // user_stats: lo gestiona useHeroStats (React Query) con su propio
            // canal -> aquí ya no se suscribe (evita doble canal).
            .subscribe((status) => {
                console.log(`GameContext: Realtime status: ${status}`);
            });

        return () => {
            console.log('GameContext: Cleaning up Realtime channel');
            supabase.removeChannel(channel);
        };
    }, [user]);

    // --- RPC HELPERS ---
    const addGold = async (amount: number) => {
        try {
            // Optimistic Update & Persist
            if (profile) {
                const newGold = (profile.gold || 0) + amount;
                const newProfile = { ...profile, gold: newGold };
                setProfile(newProfile);

                // SAVE TO LOCAL IMMEDIATELLY (Critical for Offline Restart)
                saveToLocal(
                    { subjects, books, customColors, bookStats },
                    { activities, movies, series, activityStats },
                    { routines, history, muscleFatigue, records },
                    { decrees },
                    { thoughts, sleepRecords },
                    { waterRecords },
                    { projects: mageProjects, themes: mageThemes },
                    newProfile
                );
            }

            // RPC Call
            const { error } = await supabase.rpc('add_gold', { amount });
            if (error) {
                console.error('RPC add_gold failed (will sync later):', error);
            }
        } catch (e) {
            console.error('GameContext: addGold error', e);
        }
    };

    const addXp = async (amount: number) => {
        try {
            // Optimistic Update & Persist
            if (profile) {
                const newXp = (profile.current_xp || 0) + amount;
                const newTotal = (profile.total_study_minutes || 0) + amount;
                const newProfile = { ...profile, current_xp: newXp, total_study_minutes: newTotal };
                setProfile(newProfile);

                // SAVE TO LOCAL IMMEDIATELLY
                saveToLocal(
                    { subjects, books, customColors, bookStats },
                    { activities, movies, series, activityStats },
                    { routines, history, muscleFatigue, records },
                    { decrees },
                    { thoughts, sleepRecords },
                    { waterRecords },
                    { projects: mageProjects, themes: mageThemes },
                    newProfile
                );
            }

            const { error } = await supabase.rpc('add_xp', { amount });
            if (error) {
                console.error('RPC add_xp failed (will sync later):', error);
            }
        } catch (e) {
            console.error('RPC Error', e);
        }
    };

    // --- MUTATORS (LIBRARY) ---
    const addSubject = async (name: string, color: string, course?: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newSubject: Subject = {
            id: tempId, user_id: user.id, name, color, course: course || null,
            is_completed: false, total_minutes_studied: 0, created_at: new Date().toISOString(),
            exams: [], final_grade: null
        };
        const newSubjects = [newSubject, ...subjects];
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('subjects').insert([{ name, color, course, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSubject;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        const newSubjects = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('subjects').update(updates).eq('id', id);
        await fetchAll();
    };

    const addBook = async (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newBook: Book = {
            id: tempId, user_id: user.id, title, author, total_pages, current_page: 0,
            cover_color, saga: saga || null, saga_index: saga_index || null,
            is_finished: false, finished_at: null, created_at: new Date().toISOString()
        };
        const newBooks = [newBook, ...books];
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('books').insert([{ title, author, total_pages, cover_color, saga, saga_index, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newBook;
    };

    const updateBook = async (id: string, updates: Partial<Book>) => {
        const newBooks = books.map(b => b.id === id ? { ...b, ...updates } : b);
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('books').update(updates).eq('id', id);
        await fetchAll();
    };

    const saveCustomColor = async (hex_code: string, name?: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('custom_colors').insert([{ hex_code, name, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data;
    };

    // --- MUTATORS (THEATRE) ---
    const addActivity = async (name: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newActivity: TheatreActivity = {
            id: tempId, user_id: user.id, name, total_minutes: 0, days_count: 0, created_at: new Date().toISOString()
        };
        const newActivities = [newActivity, ...activities];
        setActivities(newActivities);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('theatre_activities').insert([{ name, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newActivity;
    };

    const updateActivity = async (id: string, name: string) => {
        const newActivities = activities.map(a => a.id === id ? { ...a, name } : a);
        setActivities(newActivities);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('theatre_activities').update({ name }).eq('id', id);
        await fetchAll();
    };

    const addMovie = async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newMovie: TheatreMovie = {
            id: tempId, user_id: user.id, title, director: director || null, saga: saga || null, comment: comment || null, rating, created_at: new Date().toISOString()
        };
        const newMovies = [newMovie, ...movies];
        setMovies(newMovies);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('theatre_movies').insert([{ title, director, saga, comment, rating, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newMovie;
    };

    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        const newMovies = movies.map(m => m.id === id ? { ...m, ...updates } : m);
        setMovies(newMovies);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('theatre_movies').update(updates).eq('id', id);
        await fetchAll();
    };

    const addSeries = async (title: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newSeriesItem: TheatreSeries & { seasons: TheatreSeason[] } = {
            id: tempId, user_id: user.id, title, created_at: new Date().toISOString(), seasons: []
        };
        const newSeriesList = [newSeriesItem, ...series];
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('theatre_series').insert([{ title, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSeriesItem;
    };

    const updateSeries = async (id: string, title: string) => {
        const newSeriesList = series.map(s => s.id === id ? { ...s, title } : s);
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('theatre_series').update({ title }).eq('id', id);
        await fetchAll();
    };

    const addSeason = async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        const tempId = `temp_${Date.now()}`;
        const newSeason: TheatreSeason = {
            id: tempId, series_id, season_number, episodes_count: episodes_count || 0, comment: comment || null, rating, created_at: new Date().toISOString()
        };
        const newSeriesList = series.map(s => s.id === series_id ? { ...s, seasons: [...(s.seasons || []), newSeason] } : s);
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('theatre_seasons').insert([{ series_id, season_number, episodes_count, comment, rating }]);
        await fetchAll();
    };

    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        const newSeriesList = series.map(s => ({
            ...s, seasons: (s.seasons || []).map(sea => sea.id === id ? { ...sea, ...updates } : sea)
        }));
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('theatre_seasons').update(updates).eq('id', id);
        await fetchAll();
    };

    // --- MUTATORS (BARRACKS) ---
    const createRoutine = async (name: string, category?: string) => {
        if (!user) return;
        const { data: routine, error: rError } = await supabase.from('routines').insert([{ name, category, user_id: user.id }]).select().single();
        if (!rError) await fetchAll();
        return routine;
    };

    const addExerciseToRoutine = async (routineId: string, exerciseId: string, orderIndex: number) => {
        await supabase.from('routine_exercises').insert([{ routine_id: routineId, exercise_id: exerciseId, order_index: orderIndex, target_sets: 3, target_reps: 10 }]);
        await fetchAll();
    };

    const removeExerciseFromRoutine = async (routineExerciseId: string) => {
        await supabase.from('routine_exercises').delete().eq('id', routineExerciseId);
        await fetchAll();
    };

    const updateRoutineExercise = async (id: string, updates: { target_sets?: number, target_reps?: number }) => {
        await supabase.from('routine_exercises').update(updates).eq('id', id);
        await fetchAll();
    };

    const deleteRoutine = async (id: string) => {
        await supabase.from('routines').delete().eq('id', id);
        await fetchAll();
    };

    // --- CALENDAR HOOK ---
    const calendar = useCalendar(user?.id);

    // Sync on load if configured
    useEffect(() => {
        if (user && calendar.importCalendarId) {
            calendar.syncNativeEventsToDecrees();
        }
    }, [user, calendar.importCalendarId]);

    // --- MUTATORS (CASTLE) ---
    const addDecree = async (decree: Partial<RoyalDecree> & { calendar_export?: boolean }) => {
        if (!user) return;
        const { calendar_export, ...decreeData } = decree;

        // 1. Create the primary/anchor decree
        const { data: mainDecree, error } = await supabase.from('royal_decrees').insert([{ ...decreeData, user_id: user.id }]).select().single();

        if (!error && mainDecree) {
            // 2. If it's repetitive, "explode" it into individual records for the next month/instances
            const recurrence = decreeData.recurrence as any;
            if (recurrence?.is_repetitive) {
                const instances: any[] = [];
                const freq = recurrence.frequency;
                const interval = recurrence.interval || 1;
                const days = recurrence.days || [];

                let runDate = decreeData.due_date ? new Date(decreeData.due_date) : new Date();
                runDate.setHours(12, 0, 0, 0); // Use midday to avoid TZ jumps

                const userEndDate = recurrence.end_date ? new Date(recurrence.end_date) : null;
                if (userEndDate) userEndDate.setHours(23, 59, 59, 999);

                const maxFuture = new Date(runDate);
                maxFuture.setFullYear(maxFuture.getFullYear() + 2);

                const stopDate = userEndDate && userEndDate < maxFuture ? userEndDate : maxFuture;

                // First instance is the start date itself (only if it matches the frequency/days)
                // Actually, let's keep it simple: the loop generates 'next' occurrences.
                // The 'Anchor' record (mainDecree) already occupies the Start date.
                // So we start calculating from the anchor date to find 'next' dates.

                let iterationDate = new Date(runDate);

                // Generate instances until stopDate
                while (iterationDate < stopDate && instances.length < 1000) {
                    let nextDate = new Date(iterationDate);

                    if (freq === 'DAILY') {
                        nextDate.setDate(iterationDate.getDate() + interval);
                    } else if (freq === 'EVERY_2_DAYS') {
                        nextDate.setDate(iterationDate.getDate() + 2);
                    } else if (freq === 'BIWEEKLY') {
                        nextDate.setDate(iterationDate.getDate() + 14);
                    } else if (freq === 'WEEKLY' || freq === 'CUSTOM') {
                        if (days && days.length > 0) {
                            let found = false;
                            for (let j = 1; j <= 7; j++) {
                                let testDate = new Date(iterationDate);
                                testDate.setDate(iterationDate.getDate() + j);
                                if (days.includes(testDate.getDay())) {
                                    nextDate = testDate;
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                nextDate = new Date(iterationDate);
                                nextDate.setDate(iterationDate.getDate() + 7);
                            }
                        } else {
                            nextDate = new Date(iterationDate);
                            nextDate.setDate(iterationDate.getDate() + 7);
                        }
                    } else if (freq === 'MONTHLY') {
                        nextDate.setMonth(iterationDate.getMonth() + 1);
                    } else {
                        nextDate.setDate(iterationDate.getDate() + 1);
                    }

                    if (nextDate > stopDate) break;

                    instances.push({
                        user_id: user.id,
                        parent_id: mainDecree.id,
                        title: mainDecree.title,
                        description: mainDecree.description,
                        type: mainDecree.type,
                        status: 'PENDING',
                        target_quantity: mainDecree.target_quantity,
                        unit: mainDecree.unit,
                        due_date: nextDate.toISOString(),
                        recurrence: { ...recurrence, is_repetitive: false },
                        required_activity_tag: mainDecree.required_activity_tag
                    });

                    iterationDate = nextDate;
                }

                if (instances.length > 0) {
                    const { error: insError } = await supabase.from('royal_decrees').insert(instances);
                    if (insError) console.error('Error inserting repetitive instances:', insError);
                }
            }

            if (calendar_export) {
                await calendar.exportDecreeToCalendar(
                    decreeData.title || 'Misión Omega',
                    decreeData.due_date ? new Date(decreeData.due_date) : new Date(),
                    decreeData.description || ''
                );
            }
            await fetchAll();
        } else if (error) {
            console.error('Error inserting main decree:', error);
        }
        return mainDecree;
    };

    const updateDecree = async (id: string, updates: Partial<RoyalDecree>) => {
        await supabase.from('royal_decrees').update(updates).eq('id', id);
        await fetchAll();
    };

    const deleteDecree = async (id: string) => {
        await supabase.from('royal_decrees').delete().eq('id', id);
        await fetchAll();
    };

    // --- MUTATORS (TEMPLE) ---
    const addThought = async (content: string, type: ThoughtType) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newThought: TempleThought = {
            id: tempId, user_id: user.id, content, type, is_resolved: false,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString()
        };
        const newThoughts = [newThought, ...thoughts];
        setThoughts(newThoughts);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts: newThoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('temple_thoughts').insert([{ content, type, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newThought;
    };

    const resolveThought = async (id: string) => {
        const newThoughts = thoughts.map(t => t.id === id ? { ...t, is_resolved: true } : t);
        setThoughts(newThoughts);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts: newThoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('temple_thoughts').update({ is_resolved: true }).eq('id', id);
        showGlobalToast('✨ Pensamiento Liberado', 'success');
        await addXp(10);
        await fetchAll();
    };

    const addSleep = async (hours: number, quality?: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newRecord: TempleSleep = {
            id: tempId, user_id: user.id, hours, quality: quality || null,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString()
        };
        const newSleepRecords = [newRecord, ...sleepRecords];
        setSleepRecords(newSleepRecords);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords: newSleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('temple_sleep').insert([{ hours, quality, user_id: user.id }]).select().single();
        if (!error) {
            await addXp(20);
            await fetchAll();
        }
        return data || newRecord;
    };

    // --- MUTATORS (TAVERN) ---
    const addWater = async (amount: number) => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        const tempId = `temp_${Date.now()}`;

        // Optimistic update: see if record for today exists to increment locally
        const existingIdx = waterRecords.findIndex(r => r.date === today);
        let newWaterRecords: TavernWater[];
        if (existingIdx >= 0) {
            newWaterRecords = [...waterRecords];
            newWaterRecords[existingIdx] = { ...newWaterRecords[existingIdx], amount: newWaterRecords[existingIdx].amount + amount };
        } else {
            const newRec: TavernWater = { id: tempId, user_id: user.id, amount, date: today, created_at: new Date().toISOString() };
            newWaterRecords = [newRec, ...waterRecords];
        }

        setWaterRecords(newWaterRecords);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords: newWaterRecords }, { projects: mageProjects, themes: mageThemes }, profile);

        if (existingIdx >= 0) {
            await supabase.from('tavern_water').update({ amount: newWaterRecords[existingIdx].amount }).eq('id', waterRecords[existingIdx].id);
        } else {
            await supabase.from('tavern_water').insert([{ amount, user_id: user.id }]);
        }

        await fetchAll();
    };

    // --- MUTATORS (MAGE TOWER) ---
    const addProject = async (name: string, themeId: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newProj: MageProject = {
            id: tempId, user_id: user.id, name, scope: null, theme_id: themeId, mana_amount: 0, status: 'ACTIVE', created_at: new Date().toISOString()
        };
        const newProjects = [newProj, ...mageProjects];
        setMageProjects(newProjects);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: newProjects, themes: mageThemes }, profile);

        const { data, error } = await supabase.from('mage_projects').insert([{ name, theme_id: themeId, user_id: user.id }]).select().single();
        if (error) {
            console.error('MageTower: Error creating project', error);
            showGlobalToast('Error al crear investigación', 'error');
        } else {
            await fetchAll();
        }
        return data || newProj;
    };

    const updateProject = async (id: string, updates: Partial<MageProject>) => {
        const newProjects = mageProjects.map(p => p.id === id ? { ...p, ...updates } : p);
        setMageProjects(newProjects);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: newProjects, themes: mageThemes }, profile);
        await supabase.from('mage_projects').update(updates).eq('id', id);
        await fetchAll();
    };

    const deleteProject = async (id: string) => {
        const newProjects = mageProjects.filter(p => p.id !== id);
        setMageProjects(newProjects);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: newProjects, themes: mageThemes }, profile);
        const { error } = await supabase.from('mage_projects').delete().eq('id', id);
        if (error) console.error('MageTower: Error deleting project', error);
        await fetchAll();
    };

    const deleteMapping = async (id: string) => {
        try {
            const { error } = await supabase.from('app_aura_mappings').delete().eq('id', id);
            if (error) throw error;
            await fetchAll();
            showGlobalToast('Canalización eliminada', 'success');
        } catch (e: any) {
            console.error(e);
            showGlobalToast('Error al eliminar canalización', 'error');
        }
    };

    const addTheme = async (name: string, symbol: string, color: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('mage_themes').insert([{ name, symbol, color, user_id: user.id }]).select().single();
        if (error) {
            console.error('MageTower: Error creating theme', error);
            showGlobalToast('Error al crear ámbito', 'error');
        } else {
            await fetchAll();
        }
        return data;
    };

    const deleteTheme = async (id: string) => {
        await supabase.from('mage_themes').delete().eq('id', id);
        await fetchAll();
    };

    const value: GameContextType = useMemo(() => ({
        library: {
            subjects,
            books,
            customColors,
            bookStats,
            loading: libraryLoading,
            refresh: fetchAll,
            addSubject,
            updateSubject,
            addBook,
            updateBook,
            saveCustomColor
        },
        theatre: {
            activities,
            movies,
            series,
            activityStats,
            loading: theatreLoading,
            refresh: fetchAll,
            addActivity,
            updateActivity,
            addMovie,
            updateMovie,
            addSeries,
            updateSeries,
            addSeason,
            updateSeason
        },
        castle: {
            decrees,
            loading: castleLoading,
            refresh: fetchAll,
            addDecree,
            updateDecree,
            deleteDecree,
            checkDecreeProgress
        },
        calendar,
        habits: {
            rituals: habitRituals,
            todayLogs: habitLogs,
            loading: habitsLoading,
            refresh: refreshHabits,
            toggleHabit,
            addRitual,
            checkHabitProgress: checkHabitProgressInternal
        },
        user,
        profile,
        heroStats,
        addGold,
        addXp,
        fetchAll,
        checkDecreeProgress
    }), [
        subjects, books, customColors, bookStats, libraryLoading,
        activities, movies, series, activityStats, theatreLoading,
        decrees, castleLoading,
        calendar,
        habitRituals, habitLogs, habitsLoading,
        user, profile, heroStats
    ]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
