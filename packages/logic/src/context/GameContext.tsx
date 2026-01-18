import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { AppState, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    // --- BARRACKS DATA ---
    barracks: {
        routines: RoutineWithExercises[];
        history: WorkoutHistoryItem[];
        muscleFatigue: MuscleFatigue;
        records: PersonalRecord[];
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        createRoutine: (name: string, category?: string) => Promise<any>;
        deleteRoutine: (id: string) => Promise<void>;
        addExerciseToRoutine: (routineId: string, exerciseId: string, orderIndex: number) => Promise<void>;
        removeExerciseFromRoutine: (routineExerciseId: string) => Promise<void>;
        updateRoutineExercise: (id: string, updates: { target_sets?: number, target_reps?: number }) => Promise<void>;
    };

    // --- WORKOUT DATA ---
    workout: {
        isSessionActive: boolean;
        startTime: string | null;
        setsLog: any[];
        startSession: (routineId: string | null, exercises: any[]) => Promise<void>;
        finishSession: () => Promise<boolean>;
        addSet: (exerciseId: string, exerciseName: string) => void;
        updateSet: (id: string, updates: Partial<any>) => void;
        removeSet: (id: string) => void;
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

    // --- TEMPLE DATA ---
    temple: {
        thoughts: TempleThought[];
        sleepRecords: TempleSleep[];
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addThought: (content: string, type: ThoughtType) => Promise<any>;
        resolveThought: (id: string) => Promise<void>;
        addSleep: (hours: number, quality?: string) => Promise<any>;
    };

    // --- TAVERN DATA ---
    tavern: {
        waterRecords: TavernWater[];
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addWater: (amount: number) => Promise<any>;
    };

    mageTower: {
        projects: MageProject[];
        themes: MageTheme[];
        loading: boolean;
        refresh: () => Promise<void>;

        // Mutations
        addProject: (name: string, themeId: string) => Promise<any>;
        updateProject: (id: string, updates: Partial<MageProject>) => Promise<void>;
        deleteProject: (id: string) => Promise<void>;
        addTheme: (name: string, symbol: string, color: string) => Promise<any>;
        deleteTheme: (id: string) => Promise<void>;
        mappings: MageAppMapping[];
        unhandledAuraByTheme: Record<string, number>;
        deleteMapping: (id: string) => Promise<void>;
        canalizeAura: (projectId: string, themeId: string) => Promise<void>;
        toggleChanneling: (projectId: string, themeId: string) => Promise<void>;
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

    // Workout State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [workoutRoutineId, setWorkoutRoutineId] = useState<string | null>(null);
    const [setsLog, setSetsLog] = useState<any[]>([]);
    const WORKOUT_STORAGE_KEY = '@omega_active_workout_v2';

    // Initial Load Flag to prevent double-fetch issues or hydration flicker
    const isHydrated = useRef(false);
    const lastProcessedSync = useRef<string | null>(null);
    const lastFullSyncRef = useRef<number>(0);
    const isFetching = useRef(false);
    const renderCount = useRef(0);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const renderBurstRef = useRef({ count: 0, lastReset: Date.now() });

    // Refs for stable state access in saveToLocal
    const subjectsRef = useRef(subjects);
    const booksRef = useRef(books);
    const customColorsRef = useRef(customColors);
    const bookStatsRef = useRef(bookStats);
    const activitiesRef = useRef(activities);
    const moviesRef = useRef(movies);
    const seriesRef = useRef(series);
    const activityStatsRef = useRef(activityStats);
    const routinesRef = useRef(routines);
    const historyRef = useRef(history);
    const muscleFatigueRef = useRef(muscleFatigue);
    const recordsRef = useRef(records);
    const decreesRef = useRef(decrees);
    const thoughtsRef = useRef(thoughts);
    const sleepRecordsRef = useRef(sleepRecords);
    const waterRecordsRef = useRef(waterRecords);
    const mageProjectsRef = useRef(mageProjects);
    const mageThemesRef = useRef(mageThemes);
    const profileRef = useRef(profile);

    // Update refs whenever state changes
    useEffect(() => { subjectsRef.current = subjects; }, [subjects]);
    useEffect(() => { booksRef.current = books; }, [books]);
    useEffect(() => { customColorsRef.current = customColors; }, [customColors]);
    useEffect(() => { bookStatsRef.current = bookStats; }, [bookStats]);
    useEffect(() => { activitiesRef.current = activities; }, [activities]);
    useEffect(() => { moviesRef.current = movies; }, [movies]);
    useEffect(() => { seriesRef.current = series; }, [series]);
    useEffect(() => { activityStatsRef.current = activityStats; }, [activityStats]);
    useEffect(() => { routinesRef.current = routines; }, [routines]);
    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { muscleFatigueRef.current = muscleFatigue; }, [muscleFatigue]);
    useEffect(() => { recordsRef.current = records; }, [records]);
    useEffect(() => { decreesRef.current = decrees; }, [decrees]);
    useEffect(() => { thoughtsRef.current = thoughts; }, [thoughts]);
    useEffect(() => { sleepRecordsRef.current = sleepRecords; }, [sleepRecords]);
    useEffect(() => { waterRecordsRef.current = waterRecords; }, [waterRecords]);
    useEffect(() => { mageProjectsRef.current = mageProjects; }, [mageProjects]);
    useEffect(() => { mageThemesRef.current = mageThemes; }, [mageThemes]);
    useEffect(() => { profileRef.current = profile; }, [profile]);

    // --- DEBUGGING HELPERS ---
    const traceFetch = useCallback((source: string, isStart: boolean, startTime?: number) => {
        if (isStart) {
            console.log(`[GameSync] 🚀 START fetchAll | Source: ${source} | Time: ${new Date().toLocaleTimeString()}`);
            return performance.now();
        } else {
            const duration = (performance.now() - (startTime || 0)).toFixed(2);
            console.log(`[GameSync] ✅ END   fetchAll | Source: ${source} | Duration: ${duration}ms`);
        }
    }, []);

    // Helper to time individual queries
    const timeQuery = useCallback(async (name: string, query: any): Promise<any> => {
        const start = performance.now();
        const res = await query;
        const duration = performance.now() - start;
        if (duration > 300) { // Log if query takes > 300ms
            console.log(`[Slow Query] 🐢 ${name}: ${duration.toFixed(0)}ms`);
        }
        return res;
    }, []);

    const {
        rituals: habitRituals,
        todayLogs: habitLogs,
        loading: habitsLoading,
        refresh: refreshHabits,
        toggleHabit,
        addRitual,
        checkHabitProgress: checkHabitProgressInternal
    } = useHabits(user?.id);

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

    const saveToLocal = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const serializationStart = performance.now();
                const dump = {
                    lib: { subjects: subjectsRef.current, books: booksRef.current, customColors: customColorsRef.current, bookStats: bookStatsRef.current },
                    theat: { activities: activitiesRef.current, movies: moviesRef.current, series: seriesRef.current, activityStats: activityStatsRef.current },
                    barracks: { routines: routinesRef.current, history: historyRef.current, muscleFatigue: muscleFatigueRef.current, records: recordsRef.current },
                    castle: { decrees: decreesRef.current },
                    temple: { thoughts: thoughtsRef.current, sleepRecords: sleepRecordsRef.current },
                    tavern: { waterRecords: waterRecordsRef.current },
                    mageTower: { projects: mageProjectsRef.current, themes: mageThemesRef.current },
                    prof: profileRef.current,
                    timestamp: Date.now()
                };
                const payload = JSON.stringify(dump);
                const serializationTime = (performance.now() - serializationStart).toFixed(2);

                const sizeInKB = (payload.length / 1024).toFixed(2);
                console.log(`[Storage] 💾 Saving to Local (Debounced) | Size: ${sizeInKB} KB | Serialization: ${serializationTime}ms`);

                await AsyncStorage.setItem(GAME_STATE_STORAGE_KEY, payload);
            } catch (e) {
                console.error('Offline Mode: Failed to save local data', e);
            } finally {
                saveTimeoutRef.current = null;
            }
        }, 2000); // 2 second debounce
    }, []);

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
            await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);

            console.log('GameContext: State cleared successfully');
        } catch (e) {
            console.error('GameContext: Failed to clear state', e);
        }
    };



    const fetchHeroStats = useCallback(async () => {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) return;

        try {
            const [profRes, statsRes] = await Promise.all([
                timeQuery('profiles', supabase.from('profiles').select('*').eq('id', currentUser.id).single()),
                timeQuery('user_stats', supabase.from('user_stats').select('*').eq('id', currentUser.id).single())
            ]);

            if (profRes.data) setProfile(profRes.data as Profile);
            if (statsRes.data) setHeroStats(statsRes.data as HeroStats);

            console.log('[GameSync] ⚡ Hero Stats Refreshed (Lightweight)');
        } catch (e) {
            console.error('fetchHeroStats Error', e);
        }
    }, [timeQuery]);

    const fetchAll = useCallback(async (triggerSource?: string) => {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) return;

        // Stabilize User State
        if (currentUser.id !== user?.id) {
            setUser(currentUser);
        }

        const now = Date.now();
        const throttleLimit = 60000; // 1 minute
        if (triggerSource && triggerSource.includes('Realtime') && (now - lastFullSyncRef.current < throttleLimit)) {
            console.log(`[GameSync] 🛡️ Throttled: Skipping ${triggerSource} (Last sync ${Math.round((now - lastFullSyncRef.current) / 1000)}s ago)`);
            return;
        }

        if (isFetching.current) {
            console.log(`[GameSync] ⚠️  Ignored concurrent fetch request from: ${triggerSource || 'Internal'}`);
            return;
        }

        console.log(`[GameSync] 🚀 START fetchAll (Source: ${triggerSource || 'Manual/Init'})`);
        lastFullSyncRef.current = now;
        isFetching.current = true;

        try {
            // --- BATCH 1: CRITICAL DATA (Blocking) ---
            await Promise.all([
                fetchHeroStats(),
                timeQuery('Royal Decrees', async () => {
                    const { data } = await supabase.from('royal_decrees').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
                    setDecrees(data || []);
                    setCastleLoading(false);
                })
            ]);

            // --- BATCH 2: DOMAIN DATA (Non-blocking/Background) ---
            const secondaryDataPromise = Promise.all([
                // Library
                timeQuery('Library', async () => {
                    const [subRes, bookRes, colRes, sessRes] = await Promise.all([
                        supabase.from('subjects').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                        supabase.from('books').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                        supabase.from('custom_colors').select('*').eq('user_id', currentUser.id),
                        supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', currentUser.id).not('book_id', 'is', null)
                    ]);

                    const bStats: Record<string, number> = {};
                    (sessRes.data || []).forEach((s: any) => {
                        if (s.book_id) bStats[s.book_id] = (bStats[s.book_id] || 0) + s.duration_minutes;
                    });

                    setSubjects(subRes.data || []);
                    setBooks(bookRes.data || []);
                    setCustomColors(colRes.data || []);
                    setBookStats(bStats);
                    setLibraryLoading(false);
                }),
                // Theatre
                timeQuery('Theatre', async () => {
                    const [actRes, movRes, serRes, seasRes] = await Promise.all([
                        supabase.from('theatre_activities').select('*').eq('user_id', currentUser.id),
                        supabase.from('theatre_movies').select('*').eq('user_id', currentUser.id),
                        supabase.from('theatre_series').select('*').eq('user_id', currentUser.id),
                        supabase.from('theatre_seasons').select('*').order('created_at', { ascending: false })
                    ]);

                    const seasonsMap: Record<string, any[]> = {};
                    (seasRes.data || []).forEach((season: any) => {
                        if (!seasonsMap[season.series_id]) seasonsMap[season.series_id] = [];
                        seasonsMap[season.series_id].push(season);
                    });

                    const seriesWithSeasons = (serRes.data || []).map((s: any) => ({
                        ...s,
                        seasons: seasonsMap[s.id] || []
                    }));

                    const tStats: Record<string, { totalMinutes: number, daysCount: number }> = {};
                    (actRes.data || []).forEach((act: any) => {
                        tStats[act.id] = { totalMinutes: act.total_minutes || 0, daysCount: act.days_count || 0 };
                    });

                    setActivities(actRes.data || []);
                    setMovies(movRes.data || []);
                    setSeries(seriesWithSeasons);
                    setActivityStats(tStats);
                    setTheatreLoading(false);
                }),
                // Barracks
                timeQuery('Barracks', async () => {
                    const [rRes, hRes, fRes, prRes] = await Promise.all([
                        supabase.from('routines').select('*, exercises:routine_exercises(*, exercise:exercises(*))').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                        supabase.from('workout_sessions').select('*, routine:routines(name), sets:workout_sets(weight_kg, reps)').eq('user_id', currentUser.id).order('started_at', { ascending: false }).limit(20),
                        supabase.rpc('get_muscle_fatigue'),
                        supabase.rpc('get_personal_records')
                    ]);

                    const formattedHistory: WorkoutHistoryItem[] = (hRes.data || []).map((session: any) => {
                        const totalTonnage = (session.sets || []).reduce((acc: number, set: any) => acc + (set.weight_kg * set.reps), 0);
                        const duration = session.ended_at
                            ? Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000) + 'm'
                            : 'En curso';

                        return {
                            id: session.id,
                            date: new Date(session.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                            routine: session.routine?.name || 'Misión Libre',
                            duration,
                            tonnage: totalTonnage.toLocaleString() + 'kg'
                        };
                    });

                    setRoutines(rRes.data || []);
                    setHistory(formattedHistory);
                    setMuscleFatigue(fRes.data || {});
                    setRecords(prRes.data || []);
                    setBarracksLoading(false);
                }),
                // Temple
                timeQuery('Temple', async () => {
                    const [thRes, slRes] = await Promise.all([
                        supabase.from('temple_thoughts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                        supabase.from('temple_sleep').select('*').eq('user_id', currentUser.id).order('date', { ascending: false }).limit(7)
                    ]);
                    setThoughts(thRes.data || []);
                    setSleepRecords(slRes.data || []);
                    setTempleLoading(false);
                }),
                // Tavern
                timeQuery('Tavern', async () => {
                    const { data } = await supabase.from('tavern_water').select('*').eq('user_id', currentUser.id).order('date', { ascending: false }).limit(1);
                    setWaterRecords(data || []);
                    setTavernLoading(false);
                }),
                // Mage Tower
                timeQuery('Mage Tower', async () => {
                    const [pRes, tRes, mRes] = await Promise.all([
                        supabase.from('mage_projects').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                        supabase.from('mage_themes').select('*').eq('user_id', currentUser.id),
                        supabase.from('app_aura_mappings').select('*').eq('user_id', currentUser.id)
                    ]);

                    const auraByTheme: Record<string, number> = {};
                    (tRes.data || []).forEach((t: any) => {
                        if (t.pending_aura > 0) auraByTheme[t.id] = t.pending_aura;
                    });

                    setMageProjects(pRes.data || []);
                    setMageThemes(tRes.data || []);
                    setMageAppMappings(mRes.data || []);
                    setUnhandledAuraByTheme(auraByTheme);
                    setMageLoading(false);
                }),
                // Habits
                refreshHabits(true)
            ]);

            secondaryDataPromise.then(() => {
                console.log('[GameSync] ✅ Secondary data batch completed in background');
                isHydrated.current = true;
                saveToLocal();
            }).catch(err => {
                console.error('[GameSync] ❌ Secondary data batch failed:', err);
            });

        } catch (error) {
            console.error('[GameSync] ❌ Full Sync Error:', error);
        } finally {
            isFetching.current = false;
            console.log('[GameSync] 🏁 Critical batch done');
        }
    }, [user?.id, fetchHeroStats, refreshHabits, saveToLocal, timeQuery]);

    // --- INIT ---
    useEffect(() => {
        // 1. Load Local Immediately
        loadFromLocal();

        // 2. Fetch Remote (Background Sync)
        fetchAll();

        // 3. Refresh on Focus (AppState)
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('GameContext: App active, refreshing data...');
                fetchAll();
            }
        });

        const intervalId = setInterval(() => {
            if (AppState.currentState === 'active') {
                fetchAll('Periodic Poll');
            }
        }, 120000); // 2 minutes

        // 6. Auth State Changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`GameContext: Auth Event -> ${event}`);

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user);
                    // Force refresh on initial load or sign in
                    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                        fetchAll('Auth Event');
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
            clearInterval(intervalId);
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Track Renders
    renderCount.current++;
    if (renderCount.current % 10 === 0) {
        console.log(`[Performance] GameProvider has rendered ${renderCount.current} times`);
    }

    // --- RENDER LOOP DETECTION ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - renderBurstRef.current.lastReset;
            const currentTotal = renderCount.current;
            const burst = currentTotal - renderBurstRef.current.count;

            if (burst > 30) { // More than 30 renders in 5 seconds
                console.warn(`[Performance] 🛑 RENDER BURST DETECTED! ${burst} renders in ${Math.round(elapsed / 1000)}s. Potential loop!`);
            }

            renderBurstRef.current = { count: currentTotal, lastReset: now };
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // 5. Realtime Subscription (Optimized Master Sync)
    // This effect re-runs when 'user' changes, ensuring we are subscribed to the correct profile.
    useEffect(() => {
        if (!user) return;

        let channel: any;
        let auraThrottleTimeout: any;

        const setupChannel = async () => {
            console.log(`GameContext: Setting up Realtime sync for user: ${user.id}`);

            channel = supabase.channel(`sync_${user.id}`)
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
                                fetchHeroStats();
                            }
                        }
                    }
                )
                // NEW: Listen for theme aura changes (Desktop Worker updates)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'mage_themes',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        if (auraThrottleTimeout) return;

                        console.log('GameContext: Mage Theme updated, throttling refresh...');
                        auraThrottleTimeout = setTimeout(() => {
                            fetchAll('Realtime Aura Sync (Throttled)');
                            auraThrottleTimeout = null;
                        }, 30000); // 30 seconds throttle for aura increases
                    }
                )
                // NEW: Hero Soul Realtime Subscription (Consolidated here for proper cleanup)
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_stats',
                        filter: `id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('GameContext: Hero Stats updated via Realtime');
                        setHeroStats(payload.new as HeroStats);
                    }
                )
                .subscribe((status) => {
                    console.log(`GameContext: Realtime status: ${status}`);
                });
        };

        setupChannel();

        return () => {
            if (channel) {
                console.log('GameContext: Cleaning up Realtime channel');
                supabase.removeChannel(channel);
            }
        };
    }, [user?.id]); // DEPENDENCY CHANGE: Only reconnect if ID changes, not object ref

    // --- RPC HELPERS ---
    const addGold = useCallback(async (amount: number) => {
        try {
            // Optimistic Update & Persist
            if (profile) {
                const newGold = (profile.gold || 0) + amount;
                const newProfile = { ...profile, gold: newGold };
                setProfile(newProfile);
                saveToLocal();
            }

            // RPC Call
            const { error } = await supabase.rpc('add_gold', { amount });
            if (error) {
                console.error('RPC add_gold failed (will sync later):', error);
            }
        } catch (e) {
            console.error('RPC Error', e);
        }
    }, [profile, saveToLocal]);

    const addXp = useCallback(async (amount: number) => {
        try {
            // Optimistic Update & Persist
            if (profile) {
                const newXp = (profile.current_xp || 0) + amount;
                const newTotal = (profile.total_study_minutes || 0) + amount;
                const newProfile = { ...profile, current_xp: newXp, total_study_minutes: newTotal };
                setProfile(newProfile);

                // SAVE TO LOCAL
                saveToLocal();
            }

            const { error } = await supabase.rpc('add_xp', { amount });
            if (error) {
                console.error('RPC add_xp failed (will sync later):', error);
            }
        } catch (e) {
            console.error('RPC Error', e);
        }
    }, [profile, saveToLocal]);

    // --- MUTATORS (LIBRARY) ---
    const addSubject = useCallback(async (name: string, color: string, course?: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newSubject: Subject = {
            id: tempId, user_id: user.id, name, color, course: course || null,
            is_completed: false, total_minutes_studied: 0, created_at: new Date().toISOString(),
            exams: [], final_grade: null
        };
        const newSubjects = [newSubject, ...subjects];
        setSubjects(newSubjects);
        saveToLocal();

        const { data, error } = await supabase.from('subjects').insert([{ name, color, course, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSubject;
    }, [user, subjects, saveToLocal, fetchAll]);

    const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
        const newSubjects = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
        setSubjects(newSubjects);
        saveToLocal();
        await supabase.from('subjects').update(updates).eq('id', id);
        await fetchAll();
    }, [subjects, books, customColors, bookStats, activities, movies, series, activityStats, routines, history, muscleFatigue, records, decrees, thoughts, sleepRecords, waterRecords, mageProjects, mageThemes, profile, fetchAll]);

    const addBook = useCallback(async (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newBook: Book = {
            id: tempId, user_id: user.id, title, author, total_pages, current_page: 0,
            cover_color, saga: saga || null, saga_index: saga_index || null,
            is_finished: false, finished_at: null, created_at: new Date().toISOString()
        };
        const newBooks = [newBook, ...books];
        setBooks(newBooks);
        saveToLocal();

        const { data, error } = await supabase.from('books').insert([{ title, author, total_pages, cover_color, saga, saga_index, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newBook;
    }, [user, books, saveToLocal, fetchAll]);

    const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
        const newBooks = books.map(b => b.id === id ? { ...b, ...updates } : b);
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, { thoughts, sleepRecords }, { waterRecords }, { projects: mageProjects, themes: mageThemes }, profile);
        await supabase.from('books').update(updates).eq('id', id);
        await fetchAll();
    }, [books, subjects, customColors, bookStats, activities, movies, series, activityStats, routines, history, muscleFatigue, records, decrees, thoughts, sleepRecords, waterRecords, mageProjects, mageThemes, profile, fetchAll]);

    const saveCustomColor = useCallback(async (hex_code: string, name?: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('custom_colors').insert([{ hex_code, name, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data;
    }, [user, fetchAll]);

    // --- MUTATORS (THEATRE) ---
    const addActivity = useCallback(async (name: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newActivity: TheatreActivity = {
            id: tempId, user_id: user.id, name, total_minutes: 0, days_count: 0, created_at: new Date().toISOString()
        };
        const newActivities = [newActivity, ...activities];
        setActivities(newActivities);
        saveToLocal();

        const { data, error } = await supabase.from('theatre_activities').insert([{ name, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newActivity;
    }, [user, activities, saveToLocal, fetchAll]);

    const updateActivity = useCallback(async (id: string, name: string) => {
        const newActivities = activities.map(a => a.id === id ? { ...a, name } : a);
        setActivities(newActivities);
        saveToLocal();
        await supabase.from('theatre_activities').update({ name }).eq('id', id);
        await fetchAll();
    }, [activities, saveToLocal, fetchAll]);

    const addMovie = useCallback(async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newMovie: TheatreMovie = {
            id: tempId, user_id: user.id, title, director: director || null, saga: saga || null, comment: comment || null, rating, created_at: new Date().toISOString()
        };
        const newMovies = [newMovie, ...movies];
        setMovies(newMovies);
        saveToLocal();

        const { data, error } = await supabase.from('theatre_movies').insert([{ title, director, saga, comment, rating, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newMovie;
    }, [user, movies, saveToLocal, fetchAll]);

    const updateMovie = useCallback(async (id: string, updates: Partial<TheatreMovie>) => {
        const newMovies = movies.map(m => m.id === id ? { ...m, ...updates } : m);
        setMovies(newMovies);
        saveToLocal();
        await supabase.from('theatre_movies').update(updates).eq('id', id);
        await fetchAll();
    }, [movies, saveToLocal, fetchAll]);

    const addSeries = useCallback(async (title: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newSeriesItem: TheatreSeries & { seasons: TheatreSeason[] } = {
            id: tempId, user_id: user.id, title, created_at: new Date().toISOString(), seasons: []
        };
        const newSeriesList = [newSeriesItem, ...series];
        setSeries(newSeriesList);
        saveToLocal();

        const { data, error } = await supabase.from('theatre_series').insert([{ title, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSeriesItem;
    }, [user, series, saveToLocal, fetchAll]);

    const updateSeries = useCallback(async (id: string, title: string) => {
        const newSeriesList = series.map(s => s.id === id ? { ...s, title } : s);
        setSeries(newSeriesList);
        saveToLocal();
        await supabase.from('theatre_series').update({ title }).eq('id', id);
        await fetchAll();
    }, [series, saveToLocal, fetchAll]);

    const addSeason = useCallback(async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        const tempId = `temp_${Date.now()}`;
        const newSeason: TheatreSeason = {
            id: tempId, series_id, season_number, episodes_count: episodes_count || 0, comment: comment || null, rating, created_at: new Date().toISOString()
        };
        const newSeriesList = series.map(s => s.id === series_id ? { ...s, seasons: [...(s.seasons || []), newSeason] } : s);
        setSeries(newSeriesList);
        saveToLocal();
        await supabase.from('theatre_seasons').insert([{ series_id, season_number, episodes_count, comment, rating }]);
        await fetchAll();
    }, [series, saveToLocal, fetchAll]);

    const updateSeason = useCallback(async (id: string, updates: Partial<TheatreSeason>) => {
        const newSeriesList = series.map(s => ({
            ...s, seasons: (s.seasons || []).map(sea => sea.id === id ? { ...sea, ...updates } : sea)
        }));
        setSeries(newSeriesList);
        saveToLocal();
        await supabase.from('theatre_seasons').update(updates).eq('id', id);
        await fetchAll();
    }, [series, saveToLocal, fetchAll]);

    // --- MUTATORS (BARRACKS) ---
    const createRoutine = useCallback(async (name: string, category?: string) => {
        if (!user) return;
        const { data: routine, error: rError } = await supabase.from('routines').insert([{ name, category, user_id: user.id }]).select().single();
        if (!rError) await fetchAll();
        return routine;
    }, [user, fetchAll]);

    const addExerciseToRoutine = useCallback(async (routineId: string, exerciseId: string, orderIndex: number) => {
        await supabase.from('routine_exercises').insert([{ routine_id: routineId, exercise_id: exerciseId, order_index: orderIndex, target_sets: 3, target_reps: 10 }]);
        await fetchAll();
    }, [fetchAll]);

    const removeExerciseFromRoutine = useCallback(async (routineExerciseId: string) => {
        await supabase.from('routine_exercises').delete().eq('id', routineExerciseId);
        await fetchAll();
    }, [fetchAll]);

    const updateRoutineExercise = useCallback(async (id: string, updates: { target_sets?: number, target_reps?: number }) => {
        await supabase.from('routine_exercises').update(updates).eq('id', id);
        await fetchAll();
    }, [fetchAll]);

    const deleteRoutine = useCallback(async (id: string) => {
        await supabase.from('routines').delete().eq('id', id);
        await fetchAll();
    }, [fetchAll]);

    // --- CALENDAR HOOK ---
    const calendar = useCalendar(user?.id);

    // Sync on load if configured
    useEffect(() => {
        if (user && calendar.importCalendarId) {
            calendar.syncNativeEventsToDecrees();
        }
    }, [user, calendar.importCalendarId]);

    // --- MUTATORS (CASTLE) ---
    const addDecree = useCallback(async (decree: Partial<RoyalDecree> & { calendar_export?: boolean }) => {
        if (!user) return;
        const { calendar_export, ...decreeData } = decree;

        // 1. Create the primary/anchor decree
        const { data: mainDecree, error } = await supabase.from('royal_decrees').insert([{ ...decreeData, user_id: user.id }]).select().single();

        if (!error && mainDecree) {
            // 2. If it's repetitive, "explode" it into individual records
            const recurrence = decreeData.recurrence as any;
            if (recurrence?.is_repetitive) {
                const instances: any[] = [];
                const freq = recurrence.frequency;
                const interval = recurrence.interval || 1;
                const days = recurrence.days || [];

                let runDate = decreeData.due_date ? new Date(decreeData.due_date) : new Date();
                runDate.setHours(12, 0, 0, 0);

                const userEndDate = recurrence.end_date ? new Date(recurrence.end_date) : null;
                if (userEndDate) userEndDate.setHours(23, 59, 59, 999);

                const maxFuture = new Date(runDate);
                maxFuture.setFullYear(maxFuture.getFullYear() + 2);

                const stopDate = userEndDate && userEndDate < maxFuture ? userEndDate : maxFuture;

                let iterationDate = new Date(runDate);

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
    }, [user, calendar, fetchAll]);

    const updateDecree = useCallback(async (id: string, updates: Partial<RoyalDecree>) => {
        await supabase.from('royal_decrees').update(updates).eq('id', id);
        await fetchAll();
    }, [fetchAll]);

    const deleteDecree = useCallback(async (id: string) => {
        await supabase.from('royal_decrees').delete().eq('id', id);
        await fetchAll();
    }, [fetchAll]);

    const checkDecreeProgress = useCallback(async (type: DecreeType, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => {
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

                    // Special logic for EXAM decrees
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
    }, [user, decrees, subjects, checkHabitProgressInternal, addXp, addGold, updateSubject, fetchAll]);

    // --- MUTATORS (TEMPLE) ---
    const addThought = useCallback(async (content: string, type: ThoughtType) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newThought: TempleThought = {
            id: tempId, user_id: user.id, content, type, is_resolved: false,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString()
        };
        const newThoughts = [newThought, ...thoughts];
        setThoughts(newThoughts);
        saveToLocal();

        const { data, error } = await supabase.from('temple_thoughts').insert([{ content, type, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newThought;
    }, [user, thoughts, saveToLocal, fetchAll]);

    const resolveThought = useCallback(async (id: string) => {
        const newThoughts = thoughts.map(t => t.id === id ? { ...t, is_resolved: true } : t);
        setThoughts(newThoughts);
        saveToLocal();
        await supabase.from('temple_thoughts').update({ is_resolved: true }).eq('id', id);
        showGlobalToast('✨ Pensamiento Liberado', 'success');
        await addXp(10);
        await fetchAll();
    }, [thoughts, saveToLocal, addXp, fetchAll]);

    const addSleep = useCallback(async (hours: number, quality?: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newRecord: TempleSleep = {
            id: tempId, user_id: user.id, hours, quality: quality || null,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString()
        };
        const newSleepRecords = [newRecord, ...sleepRecords];
        setSleepRecords(newSleepRecords);
        saveToLocal();

        const { data, error } = await supabase.from('temple_sleep').insert([{ hours, quality, user_id: user.id }]).select().single();
        if (!error) {
            await addXp(20);
            await fetchAll();
        }
        return data || newRecord;
    }, [user, sleepRecords, saveToLocal, addXp, fetchAll]);

    // --- MUTATORS (TAVERN) ---
    const addWater = useCallback(async (amount: number) => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        const tempId = `temp_${Date.now()}`;

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
        saveToLocal();

        if (existingIdx >= 0) {
            await supabase.from('tavern_water').update({ amount: newWaterRecords[existingIdx].amount }).eq('id', waterRecords[existingIdx].id);
        } else {
            await supabase.from('tavern_water').insert([{ amount, user_id: user.id }]);
        }

        await fetchAll();
    }, [user, waterRecords, saveToLocal, fetchAll]);

    // --- MUTATORS (MAGE TOWER) ---
    const addProject = useCallback(async (name: string, themeId: string) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newProj: MageProject = {
            id: tempId, user_id: user.id, name, scope: null, theme_id: themeId, mana_amount: 0, status: 'ACTIVE', created_at: new Date().toISOString()
        };
        const newProjects = [newProj, ...mageProjects];
        setMageProjects(newProjects);
        saveToLocal();

        const { data, error } = await supabase.from('mage_projects').insert([{ name, theme_id: themeId, user_id: user.id }]).select().single();
        if (error) {
            console.error('MageTower: Error creating project', error);
            showGlobalToast('Error al crear investigación', 'error');
        } else {
            await fetchAll();
        }
        return data || newProj;
    }, [user, mageProjects, saveToLocal, fetchAll]);

    const updateProject = useCallback(async (id: string, updates: Partial<MageProject>) => {
        const newProjects = mageProjects.map(p => p.id === id ? { ...p, ...updates } : p);
        setMageProjects(newProjects);
        saveToLocal();
        await supabase.from('mage_projects').update(updates).eq('id', id);
        await fetchAll();
    }, [mageProjects, saveToLocal, fetchAll]);

    const deleteProject = useCallback(async (id: string) => {
        const newProjects = mageProjects.filter(p => p.id !== id);
        setMageProjects(newProjects);
        saveToLocal();
        const { error } = await supabase.from('mage_projects').delete().eq('id', id);
        if (error) console.error('MageTower: Error deleting project', error);
        await fetchAll();
    }, [mageProjects, saveToLocal, fetchAll]);

    const deleteMapping = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('app_aura_mappings').delete().eq('id', id);
            if (error) throw error;
            await fetchAll();
            showGlobalToast('Canalización eliminada', 'success');
        } catch (e: any) {
            console.error(e);
            showGlobalToast('Error al eliminar canalización', 'error');
        }
    }, [fetchAll]);

    const addTheme = useCallback(async (name: string, symbol: string, color: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('mage_themes').insert([{ name, symbol, color, user_id: user.id }]).select().single();
        if (error) {
            console.error('MageTower: Error creating theme', error);
            showGlobalToast('Error al crear ámbito', 'error');
        } else {
            await fetchAll();
        }
        return data;
    }, [user, fetchAll]);

    const deleteTheme = useCallback(async (id: string) => {
        await supabase.from('mage_themes').delete().eq('id', id);
        await fetchAll();
    }, [fetchAll]);

    const canalizeAura = useCallback(async (projectId: string, themeId: string) => {
        if (!profile) return;
        const aura = unhandledAuraByTheme[themeId] || 0;
        if (aura <= 0) return;

        const project = mageProjects.find(p => p.id === projectId);
        if (!project) return;

        // 1. Update project mana
        const { error: pError } = await supabase
            .from('mage_projects')
            .update({ mana_amount: project.mana_amount + aura })
            .eq('id', projectId);

        if (pError) throw pError;

        // 2. Reset theme pending_aura to 0
        const { error: themeError } = await supabase
            .from('mage_themes')
            .update({ pending_aura: 0 })
            .eq('id', themeId);

        if (themeError) throw themeError;

        await fetchAll();
        showGlobalToast(`¡${aura} de Aura canalizada con éxito!`, 'success');
    }, [profile, unhandledAuraByTheme, mageProjects, fetchAll]);

    const toggleChanneling = useCallback(async (projectId: string, themeId: string) => {
        if (!profile) return;
        const theme = mageThemes.find(t => t.id === themeId);
        if (!theme) return;

        // Toggle logic: If currently active, disable. If different or null, enable.
        const isCurrentlyActive = theme.active_project_id === projectId;
        const newActiveId = isCurrentlyActive ? null : projectId;

        // 1. Update theme active_project_id
        const { error } = await supabase
            .from('mage_themes')
            .update({ active_project_id: newActiveId })
            .eq('id', themeId);

        if (error) {
            showGlobalToast('Error al cambiar canalización', 'error');
            return;
        }

        // 2. If Activating, FLUSH pending aura immediately to this project
        if (newActiveId) {
            const aura = unhandledAuraByTheme[themeId] || 0;
            if (aura > 0) {
                const project = mageProjects.find(p => p.id === newActiveId);
                if (project) {
                    await supabase.from('mage_projects').update({ mana_amount: project.mana_amount + aura }).eq('id', newActiveId);
                    await supabase.from('mage_themes').update({ pending_aura: 0 }).eq('id', themeId);
                    showGlobalToast(`Conexión establecida. +${aura} Aura transferida.`, 'success');
                } else {
                    showGlobalToast('Conexión establecida', 'success');
                }
            } else {
                showGlobalToast('Conexión establecida', 'success');
            }
        } else {
            showGlobalToast('Canalización detenida', 'info');
        }

        await fetchAll();
    }, [profile, mageThemes, unhandledAuraByTheme, fetchAll]);

    // --- WORKOUT LOGIC ---
    useEffect(() => {
        const recoverWorkout = async () => {
            const saved = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                setIsSessionActive(true);
                setStartTime(data.startTime);
                setWorkoutRoutineId(data.routineId);
                setSetsLog(data.setsLog || []);
            }
        };
        recoverWorkout();
    }, []);

    const startSession = useCallback(async (routineId: string | null = null, initialExercises: any[] = []) => {
        const now = new Date().toISOString();
        setStartTime(now);
        setWorkoutRoutineId(routineId);
        setIsSessionActive(true);

        const initialSets: any[] = [];
        initialExercises.forEach(ex => {
            const targetSets = ex.target_sets || 3;
            const targetReps = ex.target_reps || 10;
            for (let i = 0; i < targetSets; i++) {
                initialSets.push({
                    id: Math.random().toString(36).substr(2, 9),
                    exercise_id: ex.exercise_id,
                    exercise_name: ex.exercise?.name_es || ex.exercise?.name || 'Ejercicio',
                    weight: 0,
                    reps: targetReps,
                    type: 'normal',
                    completed: false
                });
            }
        });
        setSetsLog(initialSets);
    }, []);

    const finishSession = useCallback(async () => {
        if (!isSessionActive || !startTime) return false;
        const completedSets = setsLog.filter(s => s.completed);
        if (completedSets.length === 0) {
            return new Promise<boolean>((resolve) => {
                Alert.alert("Aviso", "¿Terminar sin registrar ninguna serie?", [
                    { text: "No", style: "cancel", onPress: () => resolve(false) },
                    {
                        text: "Sí, abandonar", style: "destructive", onPress: async () => {
                            await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);
                            setIsSessionActive(false);
                            resolve(true);
                        }
                    }
                ]);
            });
        }

        try {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) throw new Error('No user');
            const totalVolume = completedSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
            const { data: session, error: sError } = await supabase.from('workout_sessions').insert([{
                user_id: u.id, routine_id: workoutRoutineId, started_at: startTime,
                ended_at: new Date().toISOString(), bodyweight: profile?.hp_current || 0,
                note: `Volumen total: ${totalVolume}kg`
            }]).select().single();
            if (sError) throw sError;
            const setsToInsert = completedSets.map((s, idx) => ({
                session_id: session.id, exercise_id: s.exercise_id, set_number: idx + 1,
                weight_kg: s.weight, reps: s.reps, type: s.type
            }));
            const { error: setsError } = await supabase.from('workout_sets').insert(setsToInsert);
            if (setsError) throw setsError;

            await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);
            setIsSessionActive(false);
            setStartTime(null);
            setSetsLog([]);

            // Actualizar Decretos Reales (BARRACKS)
            const durationSec = startTime ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000) : 0;
            const durationMin = Math.round(durationSec / 60);
            await checkDecreeProgress('BARRACKS', '', 1, durationMin);

            await fetchAll();
            showGlobalToast(`¡Batalla Concluida! Daño: ${totalVolume}kg`, 'success');
            return true;
        } catch (e: any) {
            Alert.alert("Error al guardar", e.message);
            return false;
        }
    }, [isSessionActive, startTime, setsLog, workoutRoutineId, profile, checkDecreeProgress, fetchAll]);

    const addSet = useCallback((exerciseId: string, exerciseName: string) => {
        const newSet = {
            id: Math.random().toString(36).substr(2, 9),
            exercise_id: exerciseId,
            exercise_name: exerciseName,
            weight: 0,
            reps: 0,
            type: 'normal',
            completed: false
        };
        setSetsLog(prev => [...prev, newSet]);
    }, []);

    const updateSet = useCallback((id: string, updates: Partial<any>) => {
        setSetsLog(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const removeSet = useCallback((id: string) => {
        setSetsLog(prev => prev.filter(s => s.id !== id));
    }, []);

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
        barracks: {
            routines,
            history,
            muscleFatigue,
            records,
            loading: barracksLoading,
            refresh: fetchAll,
            createRoutine,
            deleteRoutine,
            addExerciseToRoutine,
            removeExerciseFromRoutine,
            updateRoutineExercise
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
        temple: {
            thoughts,
            sleepRecords,
            loading: templeLoading,
            refresh: fetchAll,
            addThought,
            resolveThought,
            addSleep
        },
        tavern: {
            waterRecords,
            loading: tavernLoading,
            refresh: fetchAll,
            addWater
        },
        mageTower: {
            projects: mageProjects,
            themes: mageThemes,
            loading: mageLoading,
            refresh: fetchAll,
            addProject,
            updateProject,
            deleteProject,
            addTheme,
            deleteTheme,
            mappings: mageAppMappings,
            unhandledAuraByTheme,
            deleteMapping,
            canalizeAura,
            toggleChanneling
        },
        calendar,
        workout: {
            isSessionActive,
            startTime,
            setsLog,
            startSession,
            finishSession,
            addSet,
            updateSet,
            removeSet
        },
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
        addXp
    }), [
        subjects, books, customColors, bookStats, libraryLoading,
        activities, movies, series, activityStats, theatreLoading,
        routines, history, muscleFatigue, records, barracksLoading,
        decrees, castleLoading,
        thoughts, sleepRecords, templeLoading,
        waterRecords, tavernLoading,
        mageProjects, mageThemes, mageLoading, mageAppMappings, unhandledAuraByTheme,
        profile, calendar,
        isSessionActive, setsLog,
        habitRituals, habitLogs, habitsLoading,
        // Functions usually don't change but included for completeness if they close over state props
        addSubject, updateSubject, addBook, updateBook, saveCustomColor,
        addActivity, updateActivity, addMovie, updateMovie, addSeries, updateSeries, addSeason, updateSeason,
        createRoutine, deleteRoutine, addExerciseToRoutine, removeExerciseFromRoutine, updateRoutineExercise,
        addDecree, updateDecree, deleteDecree, checkDecreeProgress,
        addThought, resolveThought, addSleep,
        addWater,
        addProject, updateProject, deleteProject, addTheme, deleteTheme, deleteMapping,
        startSession, finishSession, addSet, updateSet, removeSet,
        refreshHabits, toggleHabit, addRitual,
        checkHabitProgressInternal, user, heroStats, addGold, addXp
    ]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
