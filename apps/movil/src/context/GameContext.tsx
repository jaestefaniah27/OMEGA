import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
    DecreeType,
    DecreeStatus,
    DecreeUnit
} from '../types/supabase';
import { showGlobalToast } from './ToastContext';

export interface RoutineWithExercises extends Routine {
    exercises: (RoutineExercise & { exercise: Exercise })[];
}

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
        elapsedSeconds: number;
        formatTime: string;
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
        addDecree: (decree: Partial<RoyalDecree>) => Promise<any>;
        updateDecree: (id: string, updates: Partial<RoyalDecree>) => Promise<void>;
        deleteDecree: (id: string) => Promise<void>;
        checkDecreeProgress: (type: DecreeType, tag: string, amount: number, durationMinutes?: number) => Promise<void>;
    };

    // --- GLOBAL ---
    user: any | null;
    profile: Profile | null;

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

    // Workout State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [workoutRoutineId, setWorkoutRoutineId] = useState<string | null>(null);
    const [setsLog, setSetsLog] = useState<any[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const WORKOUT_STORAGE_KEY = '@omega_active_workout_v2';

    // Initial Load Flag to prevent double-fetch issues or hydration flicker
    const isHydrated = useRef(false);

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
        profData: any
    ) => {
        try {
            const dump = {
                lib: libData,
                theat: theatData,
                barracks: barracksData,
                castle: castleData,
                prof: profData,
                timestamp: Date.now()
            };
            await AsyncStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(dump));
        } catch (e) {
            console.error('Offline Mode: Failed to save local data', e);
        }
    };

    // --- WORKOUT LOGIC ---
    useEffect(() => {
        const loadWorkout = async () => {
            const saved = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                setStartTime(data.startTime);
                setWorkoutRoutineId(data.routineId);
                setSetsLog(data.sets);
                setIsSessionActive(true);
                const start = new Date(data.startTime).getTime();
                setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
            }
        };
        loadWorkout();
    }, []);

    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                const start = new Date(startTime).getTime();
                setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, startTime]);

    useEffect(() => {
        if (isSessionActive && startTime) {
            const state = { startTime, routineId: workoutRoutineId, sets: setsLog };
            AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(state));
        }
    }, [isSessionActive, startTime, workoutRoutineId, setsLog]);

    const startSession = async (routineId: string | null = null, initialExercises: any[] = []) => {
        const now = new Date().toISOString();
        setStartTime(now);
        setWorkoutRoutineId(routineId);
        setElapsedSeconds(0);
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
    };

    const finishSession = async () => {
        if (!isSessionActive || !startTime) return false;
        const completedSets = setsLog.filter(s => s.completed);
        if (completedSets.length === 0) {
            return new Promise<boolean>((resolve) => {
                Alert.alert("Aviso", "¿Terminar sin registrar ninguna serie?", [
                    { text: "No", style: "cancel", onPress: () => resolve(false) },
                    { text: "Sí, abandonar", style: "destructive", onPress: async () => {
                        await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);
                        setIsSessionActive(false);
                        resolve(true);
                    }}
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
    };

    const addSet = (exerciseId: string, exerciseName: string) => {
        const newSet = {
            id: Math.random().toString(36).substr(2, 9),
            exercise_id: exerciseId, exercise_name: exerciseName,
            weight: 0, reps: 0, type: 'normal', completed: false
        };
        setSetsLog(prev => [...prev, newSet]);
    };

    const updateSet = (id: string, updates: Partial<any>) => {
        setSetsLog(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeSet = (id: string) => {
        setSetsLog(prev => prev.filter(s => s.id !== id));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const checkDecreeProgress = async (type: DecreeType, tag: string, amount: number, durationMinutes?: number) => {
        if (!user || !decrees) return;

        const pendingDecrees = decrees.filter(d => 
            d.status === 'PENDING' && 
            d.type === type && 
            (!d.required_activity_tag || d.required_activity_tag === tag)
        );

        let updated = false;

        for (const decree of pendingDecrees) {
            // Validate minimum time if specified in recurrence
            const minTime = decree.recurrence?.min_time || 0;
            if (minTime > 0 && durationMinutes !== undefined && durationMinutes < minTime) {
                continue; // Does not meet minimum requirements
            }

            const newQuantity = (decree.current_quantity || 0) + amount;
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
                setBarracksLoading(true);
            }

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            if (!currentUser) return;

            // PARALLEL FETCH
            const results = await Promise.all([
                // 0: subjects
                supabase.from('subjects').select('*').order('created_at', { ascending: false }),
                // 1: books
                supabase.from('books').select('*').order('created_at', { ascending: false }),
                // 2: custom_colors
                supabase.from('custom_colors').select('*').order('created_at', { ascending: false }),
                // 3: study_sessions
                supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', currentUser.id).not('book_id', 'is', null),
                // 4: theatre_activities
                supabase.from('theatre_activities').select('*').order('created_at', { ascending: false }),
                // 5: theatre_movies
                supabase.from('theatre_movies').select('*').order('created_at', { ascending: false }),
                // 6: theatre_series
                supabase.from('theatre_series').select('*').order('created_at', { ascending: false }),
                // 7: theatre_seasons
                supabase.from('theatre_seasons').select('*').order('season_number', { ascending: true }),
                // 8: profiles
                supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
                // 9: routines
                supabase.from('routines').select(`*, exercises:routine_exercises(*, exercise:exercises(*))`).eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                // 10: workout_history
                supabase.from('workout_sessions').select(`*, routine:routines(name), sets:workout_sets(weight_kg, reps)`).eq('user_id', currentUser.id).order('started_at', { ascending: false }).limit(5),
                // 11: muscle_fatigue
                supabase.rpc('get_muscle_heat_map', { user_uuid: currentUser.id }),
                // 12: personal_records
                supabase.rpc('get_personal_records', { user_uuid: currentUser.id }),
                // 13: royal_decrees
                supabase.from('royal_decrees').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
            ]);

            const subData = results[0].data || [];
            const bookData = results[1].data || [];
            const colData = results[2].data || [];
            const sessData = results[3].data || [];
            const actData = results[4].data || [];
            const movData = results[5].data || [];
            const serData = results[6].data || [];
            const seasData = results[7].data || [];
            const profData = results[8].data;
            const routineData = results[9].data || [];
            const rawHistory = results[10].data || [];
            const fatigueData = results[11].data || {};
            const recordData = results[12].data || [];
            const decreeData = results[13].data || [];

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
            const seriesWithSeasons = serData.map((s: any) => ({
                ...s,
                seasons: seasData.filter((season: any) => season.series_id === s.id)
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

            // --- PROCESS BARRACKS ---
            const formattedHistory: WorkoutHistoryItem[] = rawHistory.map((session: any) => {
                const totalTonnage = session.sets.reduce((acc: number, set: any) => acc + (set.weight_kg * set.reps), 0);
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

            setRoutines(routineData);
            setHistory(formattedHistory);
            setMuscleFatigue(fatigueData);
            setRecords(recordData);
            setDecrees(decreeData);

            // --- PERSIST ---
            saveToLocal(
                { subjects: subData, books: bookData, customColors: colData, bookStats: bStats },
                { activities: actData, movies: movData, series: seriesWithSeasons, activityStats: tStats },
                { routines: routineData, history: formattedHistory, muscleFatigue: fatigueData, records: recordData },
                { decrees: decreeData },
                profData
            );

        } catch (error) {
            console.error('GameContext: Fetch Error', error);
        } finally {
            setLibraryLoading(false);
            setTheatreLoading(false);
            setBarracksLoading(false);
            setCastleLoading(false);
            isHydrated.current = true;
        }
    };

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

        // 4. Periodic Polling (Every 2 minutes)
        // Ensure freshness even if Realtime disconnects silently
        const intervalId = setInterval(() => {
            if (AppState.currentState === 'active') {
                console.log('GameContext: Periodic Poll...');
                fetchAll();
            }
        }, 120000); // 2 minutes

        // 5. Realtime Subscriptions
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase.channel('game_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'books', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_colors', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'theatre_activities', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'theatre_movies', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'theatre_series', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'theatre_seasons' }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${user.id}` }, () => fetchAll())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => fetchAll())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const sub = setupRealtime();
        return () => {
            sub.then(cleanup => cleanup && cleanup());
            subscription.remove();
            clearInterval(intervalId);
        };
    }, []);

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
                    newProfile
                );
            }

            // RPC Call
            const { error } = await supabase.rpc('add_gold', { amount });
            if (error) {
                console.error('RPC add_gold failed (will sync later):', error);
            }
        } catch (e) {
            console.error('RPC Error', e);
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
            is_completed: false, total_minutes_studied: 0, created_at: new Date().toISOString()
        };
        const newSubjects = [newSubject, ...subjects];
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);

        const { data, error } = await supabase.from('subjects').insert([{ name, color, course, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSubject;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        const newSubjects = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);

        const { data, error } = await supabase.from('books').insert([{ title, author, total_pages, cover_color, saga, saga_index, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newBook;
    };

    const updateBook = async (id: string, updates: Partial<Book>) => {
        const newBooks = books.map(b => b.id === id ? { ...b, ...updates } : b);
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);

        const { data, error } = await supabase.from('theatre_activities').insert([{ name, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newActivity;
    };

    const updateActivity = async (id: string, name: string) => {
        const newActivities = activities.map(a => a.id === id ? { ...a, name } : a);
        setActivities(newActivities);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);

        const { data, error } = await supabase.from('theatre_movies').insert([{ title, director, saga, comment, rating, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newMovie;
    };

    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        const newMovies = movies.map(m => m.id === id ? { ...m, ...updates } : m);
        setMovies(newMovies);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);

        const { data, error } = await supabase.from('theatre_series').insert([{ title, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data || newSeriesItem;
    };

    const updateSeries = async (id: string, title: string) => {
        const newSeriesList = series.map(s => s.id === id ? { ...s, title } : s);
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
        await supabase.from('theatre_seasons').insert([{ series_id, season_number, episodes_count, comment, rating }]);
        await fetchAll();
    };

    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        const newSeriesList = series.map(s => ({
            ...s, seasons: (s.seasons || []).map(sea => sea.id === id ? { ...sea, ...updates } : sea)
        }));
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, { routines, history, muscleFatigue, records }, { decrees }, profile);
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

    // --- MUTATORS (CASTLE) ---
    const addDecree = async (decree: Partial<RoyalDecree>) => {
        if (!user) return;
        const { data, error } = await supabase.from('royal_decrees').insert([{ ...decree, user_id: user.id }]).select().single();
        if (!error) await fetchAll();
        return data;
    };

    const updateDecree = async (id: string, updates: Partial<RoyalDecree>) => {
        await supabase.from('royal_decrees').update(updates).eq('id', id);
        await fetchAll();
    };

    const deleteDecree = async (id: string) => {
        await supabase.from('royal_decrees').delete().eq('id', id);
        await fetchAll();
    };

    const value: GameContextType = {
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
        workout: {
            isSessionActive,
            elapsedSeconds,
            formatTime: formatTime(elapsedSeconds),
            setsLog,
            startSession,
            finishSession,
            addSet,
            updateSet,
            removeSet
        },
        user,
        profile,
        addGold,
        addXp
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
