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
    Profile
} from '../types/supabase';

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
                if (prof) {
                    setProfile(prof);
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
        profData: any
    ) => {
        try {
            const dump = {
                lib: libData,
                theat: theatData,
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
            await fetchAll();
            Alert.alert("¡Batalla Concluida!", `Has causado ${totalVolume} puntos de daño (tonelaje).`);
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

            // PARALLEL FETCH
            const [
                { data: subData },
                { data: bookData },
                { data: colData },
                { data: sessData },
                { data: actData },
                { data: movData },
                { data: serData },
                { data: seasData },
                { data: profData }
            ] = await Promise.all([
                // Library
                supabase.from('subjects').select('*').order('created_at', { ascending: false }),
                supabase.from('books').select('*').order('created_at', { ascending: false }),
                supabase.from('custom_colors').select('*').order('created_at', { ascending: false }),
                supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', currentUser.id).not('book_id', 'is', null),

                // Theatre
                supabase.from('theatre_activities').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_movies').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_series').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_seasons').select('*').order('season_number', { ascending: true }),

                // Profile
                supabase.from('profiles').select('*').eq('id', currentUser.id).single()
            ]);

            // --- PROCESS LIBRARY ---
            const newSubjects = subData || [];
            const newBooks = bookData || [];
            const newColors = colData || [];

            const bStats: Record<string, number> = {};
            (sessData || []).forEach((s: any) => {
                if (s.book_id) {
                    bStats[s.book_id] = (bStats[s.book_id] || 0) + s.duration_minutes;
                }
            });

            setSubjects(newSubjects);
            setBooks(newBooks);
            setCustomColors(newColors);
            setBookStats(bStats);

            // --- PROCESS THEATRE ---
            const seriesWithSeasons = (serData || []).map((s: any) => ({
                ...s,
                seasons: (seasData || []).filter((season: any) => season.series_id === s.id)
            }));

            const tStats: Record<string, { totalMinutes: number, daysCount: number }> = {};
            (actData || []).forEach((act: any) => {
                tStats[act.id] = {
                    totalMinutes: act.total_minutes || 0,
                    daysCount: act.days_count || 0
                };
            });

            const newActivities = actData || [];
            const newMovies = movData || [];

            setActivities(newActivities);
            setMovies(newMovies);
            setSeries(seriesWithSeasons);
            setActivityStats(tStats);

            // --- PROCESS PROFILE ---
            if (profData) {
                setProfile(profData as Profile);
            }

            // --- PERSIST ---
            saveToLocal(
                { subjects: newSubjects, books: newBooks, customColors: newColors, bookStats: bStats },
                { activities: newActivities, movies: newMovies, series: seriesWithSeasons, activityStats: tStats },
                profData
            );

        } catch (error) {
            console.error('GameContext: Fetch Error', error);
        } finally {
            setLibraryLoading(false);
            setTheatreLoading(false);
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
                    newProfile
                );
            }

            // RPC Call
            const { error } = await supabase.rpc('add_gold', { amount });
            if (error) {
                console.error('RPC add_gold failed (will sync later):', error);
                // Note: Without a sync queue, this change exists only locally until next successful sync/fetch overwrites it.
                // But at least it persists across restarts while offline.
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

        // Optimistic
        const tempId = `temp_${Date.now()}`;
        const newSubject: Subject = {
            id: tempId,
            user_id: user.id,
            name,
            color,
            course: course || null,
            is_completed: false,
            total_minutes_studied: 0,
            created_at: new Date().toISOString()
        };
        const newSubjects = [newSubject, ...subjects];
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, profile);

        const { data, error } = await supabase.from('subjects').insert([{ name, color, course, user_id: user.id }]).select().single();
        if (error) {
            console.error('Offline Action Queued (Subject)', error);
            // In a full system we'd add to a SyncQueue. Here we rely on persistent Optimistic UI.
            return newSubject;
        }
        await fetchAll(); // Replaces temp ID with real ID
        return data;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        // Optimistic
        const newSubjects = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
        setSubjects(newSubjects);
        saveToLocal({ subjects: newSubjects, books, customColors, bookStats }, { activities, movies, series, activityStats }, profile);

        const { error } = await supabase.from('subjects').update(updates).eq('id', id);
        if (error) console.error('Offline Action Queued (Update Subject)', error);
        else await fetchAll();
    };

    const addBook = async (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => {
        if (!user) return;

        // Optimistic
        const tempId = `temp_${Date.now()}`;
        const newBook: Book = {
            id: tempId,
            user_id: user.id,
            title,
            author,
            total_pages,
            current_page: 0,
            cover_color,
            saga: saga || null,
            saga_index: saga_index || null,
            is_finished: false,
            finished_at: null,
            created_at: new Date().toISOString()
        };
        const newBooks = [newBook, ...books];
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, profile);

        const { data, error } = await supabase.from('books').insert([{
            title, author, total_pages, cover_color, saga, saga_index, user_id: user.id
        }]).select().single();

        if (error) {
            console.error('Offline Action Queued (Book)', error);
            return newBook;
        }
        await fetchAll();
        return data;
    };

    const updateBook = async (id: string, updates: Partial<Book>) => {
        // Optimistic
        const newBooks = books.map(b => b.id === id ? { ...b, ...updates } : b);
        setBooks(newBooks);
        saveToLocal({ subjects, books: newBooks, customColors, bookStats }, { activities, movies, series, activityStats }, profile);

        const { error } = await supabase.from('books').update(updates).eq('id', id);
        if (error) console.error('Offline Action Queued (Update Book)', error);
        else await fetchAll();
    };

    const saveCustomColor = async (hex_code: string, name?: string) => {
        if (!user) return;
        if (customColors.some(c => c.hex_code.toUpperCase() === hex_code.toUpperCase())) return;

        const { data, error } = await supabase.from('custom_colors').insert([{
            hex_code, name, user_id: user.id
        }]).select().single();
        if (error) throw error;
        await fetchAll();
        return data;
    };


    // --- MUTATORS (THEATRE) ---
    const addActivity = async (name: string) => {
        if (!user) return;

        // Optimistic
        const tempId = `temp_${Date.now()}`;
        const newActivity: TheatreActivity = {
            id: tempId,
            user_id: user.id,
            name,
            total_minutes: 0,
            days_count: 0,
            created_at: new Date().toISOString()
        };
        const newActivities = [newActivity, ...activities];
        setActivities(newActivities);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, profile);

        const { data, error } = await supabase.from('theatre_activities').insert([{ name, user_id: user.id }]).select().single();
        if (error) {
            console.error('Offline Queued (Activity)', error);
            return newActivity;
        }
        await fetchAll();
        return data;
    };

    const updateActivity = async (id: string, name: string) => {
        // Optimistic
        const newActivities = activities.map(a => a.id === id ? { ...a, name } : a);
        setActivities(newActivities);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities: newActivities, movies, series, activityStats }, profile);

        const { error } = await supabase.from('theatre_activities').update({ name }).eq('id', id);
        if (error) console.error('Offline Queued (Update Activity)', error);
        else await fetchAll();
    };

    const addMovie = async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        if (!user) return;

        // Optimistic
        const tempId = `temp_${Date.now()}`;
        const newMovie: TheatreMovie = {
            id: tempId,
            user_id: user.id,
            title,
            director: director || null,
            saga: saga || null,
            comment: comment || null,
            rating,
            created_at: new Date().toISOString()
        };
        const newMovies = [newMovie, ...movies];
        setMovies(newMovies);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, profile);

        const { data, error } = await supabase.from('theatre_movies').insert([{
            title, director, saga, comment, rating, user_id: user.id
        }]).select().single();

        if (error) {
            console.error('Offline Queued (Movie)', error);
            return newMovie;
        }
        await fetchAll();
        return data;
    };

    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        // Optimistic
        const newMovies = movies.map(m => m.id === id ? { ...m, ...updates } : m);
        setMovies(newMovies);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies: newMovies, series, activityStats }, profile);

        const { error } = await supabase.from('theatre_movies').update(updates).eq('id', id);
        if (error) console.error('Offline Queued (Update Movie)', error);
        else await fetchAll();
    };

    const addSeries = async (title: string) => {
        if (!user) return;

        // Optimistic
        const tempId = `temp_${Date.now()}`;
        const newSeriesItem: TheatreSeries & { seasons: TheatreSeason[] } = {
            id: tempId,
            user_id: user.id,
            title,
            created_at: new Date().toISOString(),
            seasons: []
        };
        const newSeriesList = [newSeriesItem, ...series];
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, profile);

        const { data, error } = await supabase.from('theatre_series').insert([{ title, user_id: user.id }]).select().single();
        if (error) {
            console.error('Offline Queued (Series)', error);
            return newSeriesItem;
        }
        await fetchAll();
        return data;
    };

    const updateSeries = async (id: string, title: string) => {
        // Optimistic
        const newSeriesList = series.map(s => s.id === id ? { ...s, title } : s);
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, profile);

        const { error } = await supabase.from('theatre_series').update({ title }).eq('id', id);
        if (error) console.error('Offline Queued (Update Series)', error);
        else await fetchAll();
    };

    const addSeason = async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        // Optimistic
        const tempId = `temp_${Date.now()}`;
        // We need to find the series and add the season to it securely
        const newSeason: TheatreSeason = {
            id: tempId,
            series_id,
            season_number,
            episodes_count: episodes_count || 0,
            comment: comment || null,
            rating,
            created_at: new Date().toISOString()
        };

        const newSeriesList = series.map(s => {
            if (s.id === series_id) {
                return { ...s, seasons: [...(s.seasons || []), newSeason] };
            }
            return s;
        });
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, profile);

        const { error } = await supabase.from('theatre_seasons').insert([{
            series_id, season_number, episodes_count, comment, rating
        }]);

        if (error) console.error('Offline Queued (Season)', error);
        else await fetchAll();
    };

    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        // Optimistic
        const newSeriesList = series.map(s => ({
            ...s,
            seasons: (s.seasons || []).map(sea => sea.id === id ? { ...sea, ...updates } : sea)
        }));
        setSeries(newSeriesList);
        saveToLocal({ subjects, books, customColors, bookStats }, { activities, movies, series: newSeriesList, activityStats }, profile);

        const { error } = await supabase.from('theatre_seasons').update(updates).eq('id', id);
        if (error) console.error('Offline Queued (Update Season)', error);
        else await fetchAll();
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
