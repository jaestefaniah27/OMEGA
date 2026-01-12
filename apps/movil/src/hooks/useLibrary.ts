import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { Subject, StudySession, Book } from '../types/supabase';

const SESSION_STORAGE_KEY = '@omega_active_session';

// --- Global Notification Setup (Required for SDK 53+) ---
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false, // Deprecated in SDK 53
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const useLibrary = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- SESSION STATE ---
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [studyMode, setStudyMode] = useState<'TIMER' | 'STOPWATCH'>('STOPWATCH');
    const [difficulty, setDifficulty] = useState<'EXPLORER' | 'CRUSADE'>('EXPLORER');
    const [targetMinutes, setTargetMinutes] = useState('25');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // --- IRON WILL HEURISTIC REFS ---
    const appState = useRef(AppState.currentState);
    const backgroundStart = useRef<number | null>(null);
    const backgroundTicks = useRef<number>(0);
    const tickInterval = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // iOS Timing Heuristic Refs
    const inactiveStart = useRef<number | null>(null);
    const isHonorableLock = useRef<boolean>(false);
    const warningNotificationId = useRef<string | null>(null);

    const [bookStats, setBookStats] = useState<Record<string, number>>({});

    // ... (rest of state)

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error: fetchError } = await supabase
                .from('subjects')
                .select('*')
                .order('created_at', { ascending: false });

            const { data: booksData, error: booksError } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch book sessions for stats
            const { data: sessionData, error: sessionError } = await supabase
                .from('study_sessions')
                .select('book_id, duration_minutes')
                .eq('user_id', user.id)
                .not('book_id', 'is', null);

            if (fetchError) throw fetchError;
            if (booksError) throw booksError;
            if (sessionError) throw sessionError;

            // Aggregate Stats
            const stats: Record<string, number> = {};
            if (sessionData) {
                sessionData.forEach(session => {
                    if (session.book_id) {
                        stats[session.book_id] = (stats[session.book_id] || 0) + session.duration_minutes;
                    }
                });
            }
            setBookStats(stats);

            setSubjects(data || []);
            setBooks(booksData || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial Load, Recovery & Realtime Subscription
    useEffect(() => {
        let channel: any;

        const init = async () => {
            // Permissions
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }

            // Recovery
            const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            if (saved) {
                const sessionData = JSON.parse(saved);
                setStartTime(sessionData.startTime);
                setStudyMode(sessionData.mode);
                setDifficulty(sessionData.difficulty);
                setTargetMinutes(sessionData.targetMinutes);

                const now = Date.now();
                setElapsedSeconds(Math.floor((now - sessionData.startTime) / 1000));
            }

            // Fetch Initial Subjects
            await fetchSubjects();

            // Setup Single Realtime Subscription
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                channel = supabase
                    .channel('public:subjects')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${user.id}` },
                        (payload: any) => {
                            if (payload.eventType === 'INSERT') {
                                setSubjects(prev => {
                                    // Idempotency check: Don't add if ID already exists
                                    if (prev.some(s => s.id === payload.new.id)) return prev;
                                    return [payload.new as Subject, ...prev];
                                });
                            }
                            else if (payload.eventType === 'UPDATE') {
                                setSubjects(prev => prev.map(s => s.id === payload.new.id ? payload.new as Subject : s));
                            }
                            else if (payload.eventType === 'DELETE') {
                                setSubjects(prev => prev.filter(s => s.id === payload.old.id));
                            }
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'books', filter: `user_id=eq.${user.id}` },
                        (payload: any) => {
                            if (payload.eventType === 'INSERT') {
                                setBooks(prev => {
                                    if (prev.some(b => b.id === payload.new.id)) return prev;
                                    return [payload.new as Book, ...prev];
                                });
                            }
                            else if (payload.eventType === 'UPDATE') {
                                setBooks(prev => prev.map(b => b.id === payload.new.id ? payload.new as Book : b));
                            }
                            else if (payload.eventType === 'DELETE') {
                                setBooks(prev => prev.filter(b => b.id === payload.old.id));
                            }
                        }
                    )
                    .subscribe();
            }
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const initSelection = async () => {
            const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            let recoveredBookId: string | undefined;
            let recoveredSubjectId: string | undefined;

            if (saved) {
                const data = JSON.parse(saved);
                recoveredBookId = data.bookId;
                recoveredSubjectId = data.subjectId;
                if (!isSessionActive) setIsSessionActive(true);
            }

            // --- SUBJECT SELECTION ---
            if (!selectedSubject && subjects.length > 0) {
                const sub = subjects.find(s => s.id === recoveredSubjectId);
                if (sub) {
                    setSelectedSubject(sub);
                } else if (!isSessionActive) {
                    setSelectedSubject(subjects.filter(s => !s.is_completed)[0] || null);
                }
            }

            // --- BOOK SELECTION ---
            if (!selectedBook && books.length > 0) {
                const book = books.find(b => b.id === recoveredBookId);
                if (book) {
                    setSelectedBook(book);
                } else if (!isSessionActive) {
                    // Default to most advanced book
                    const activeBooks = books
                        .filter(b => !b.is_finished)
                        .sort((a, b) => {
                            const progA = a.current_page / (a.total_pages || 1);
                            const progB = b.current_page / (b.total_pages || 1);
                            return progB - progA;
                        });
                    setSelectedBook(activeBooks[0] || null);
                }
            }
        };

        initSelection();
    }, [subjects, books, isSessionActive]);

    // 2. Timer Heartbeat
    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedSeconds(elapsed);

                if (studyMode === 'TIMER') {
                    const targetSecs = parseInt(targetMinutes) * 60;
                    if (elapsed === targetSecs) {
                        sendLocalNotification('⌛ ¡Tiempo Cumplido!', 'Has alcanzado tu objetivo de estudio.');
                    }
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, startTime, studyMode, targetMinutes]);

    // 3. Iron Will Refined Heuristic (AppState)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (!isSessionActive || difficulty !== 'CRUSADE') {
                appState.current = nextAppState;
                return;
            }

            // iOS Specific: active -> inactive (potential lock or switch start)
            if (appState.current === 'active' && nextAppState === 'inactive') {
                inactiveStart.current = Date.now();
                console.log('Iron Will: Inactive start recorded (iOS)');
            }

            // Transition to Background (Judgement Day)
            if (nextAppState === 'background') {
                backgroundStart.current = Date.now();
                backgroundTicks.current = 0;

                // HEURISTIC A: iOS Timing (Transition Speed)
                if (Platform.OS === 'ios' && inactiveStart.current) {
                    const transitionDelay = Date.now() - inactiveStart.current;
                    console.log(`Iron Will: Transition Delay = ${transitionDelay}ms`);

                    // In iOS, a screen lock transitions almost instantly (< 100ms)
                    // An app switch or minimization takes much longer (> 500ms)
                    if (transitionDelay < 150) {
                        isHonorableLock.current = true;
                        console.log('Iron Will: Veredicto -> BLOQUEO HONRABLE');
                    } else {
                        isHonorableLock.current = false;
                        console.log('Iron Will: Veredicto -> POSIBLE DISTRACCIÓN');
                    }
                } else {
                    // Android or Fallback: Assume suspicious
                    isHonorableLock.current = false;
                }

                // If not identified as a lock, start the tick heartbeat
                if (!isHonorableLock.current) {
                    tickInterval.current = setInterval(() => {
                        backgroundTicks.current += 1;
                    }, 1000);

                    console.log('Iron Will [V5]: Enviando primer aviso (Unified ID)...');
                    Notifications.scheduleNotificationAsync({
                        identifier: 'iron-will-main-alert',
                        content: {
                            title: '⚠️ ¡HONOR EN JUEGO!',
                            body: 'Mantente enfocado. Si usas otras apps, la cruzada fallará.',
                            sound: true,
                            // @ts-ignore
                            relevanceScore: 0.5,
                        },
                        trigger: null,
                    });

                    // Schedule Epic Warning (5s before the 15s limit)
                    // BY USING THE SAME IDENTIFIER, we force the OS to replace the old one.
                    // This is the only way to "eliminate" the previous alert in the background.
                    console.log('Iron Will [V5]: Programando aviso épico (Unified ID) para dentro de 10s...');
                    Notifications.scheduleNotificationAsync({
                        identifier: 'iron-will-main-alert',
                        content: {
                            title: '¡EL JUICIO FINAL SE ACERCA! ⚖️',
                            subtitle: '� ÚLTIMA OPORTUNIDAD �',
                            body: '5 segundos para la deshonra eterna. ¡Vuelve ahora!',
                            sound: true,
                            // @ts-ignore
                            interruptionLevel: 'time-sensitive',
                            // @ts-ignore
                            relevanceScore: 1.0,
                        },
                        trigger: {
                            type: 'timeInterval',
                            seconds: 10,
                            repeats: false,
                        } as any,
                    }).then(id => {
                        warningNotificationId.current = id;
                        console.log('Iron Will [V5]: Aviso épico programado con ID Unificado:', id);
                    }).catch(err => {
                        console.error('Iron Will [V5]: Error programando aviso épico:', err);
                    });
                }
            }

            // Return to Active
            if (nextAppState === 'active') {
                // Cancel/Dismiss the unified identifier
                Notifications.dismissNotificationAsync('iron-will-main-alert');
                Notifications.cancelScheduledNotificationAsync('iron-will-main-alert');

                if (warningNotificationId.current) {
                    Notifications.cancelScheduledNotificationAsync(warningNotificationId.current);
                    warningNotificationId.current = null;
                }

                if (tickInterval.current) {
                    clearInterval(tickInterval.current);
                    tickInterval.current = null;
                }

                if (backgroundStart.current) {
                    const timeAway = (Date.now() - backgroundStart.current) / 1000;
                    const ticks = backgroundTicks.current;

                    // Apply penalty ONLY if it wasn't an honorable lock
                    if (!isHonorableLock.current) {
                        // NEW JUDGEMENT ALGORITHM:
                        // 1. Grace Period (< 5s)
                        if (timeAway < 5) {
                            console.log('Iron Will: Perdonado (Periodo de gracia < 5s)');
                        }
                        // 2. Absolute Distraction (>= 15s)
                        // Even if ticks are 0 (OS suspended), staying away 15s from a Crusade is a fail.
                        else if (timeAway >= 15) {
                            console.warn(`Iron Will: DESHONRA por tiempo excesivo fuera (>= 15s). TimeAway: ${timeAway}`);
                            failSession();
                        }
                        // 3. Active Distraction (5s - 15s)
                        // Check if the event loop was active during the interval.
                        else if (ticks > 3) {
                            console.warn(`Iron Will: DESHONRA por actividad en segundo plano. Ticks: ${ticks}, TimeAway: ${timeAway}`);
                            failSession();
                        }
                        else {
                            console.log(`Iron Will: Perdonado (Poca actividad fuera). Ticks: ${ticks}, TimeAway: ${timeAway}`);
                        }
                    } else {
                        console.log('Iron Will: Bienvenido de vuelta, caballero honorable.');
                    }
                }

                // Reset refs
                backgroundStart.current = null;
                backgroundTicks.current = 0;
                inactiveStart.current = null;
                isHonorableLock.current = false;
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isSessionActive, difficulty, startTime]);

    const sendLocalNotification = async (title: string, body: string) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                    // SDK 53 Compatibility
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Immediate
            });
        } catch (e) {
            console.error('Error sending notification:', e);
        }
    };

    const failSession = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const subId = selectedSubject?.id;
        const start = startTime;

        setIsSessionActive(false);
        setElapsedSeconds(0);
        setStartTime(null);
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);

        if (subId && start) {
            try {
                await logStudySession({
                    subject_id: subId,
                    start_time: new Date(start).toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: 0,
                    mode: studyMode,
                    status: 'ABANDONED',
                    difficulty: 'CRUSADE',
                    notes: 'Sesión fallida por distracción (Heurística Iron Will V2).'
                });
                Alert.alert(
                    '💀 Deshonra',
                    'Has huido del campo de batalla. Tu honor ha sido manchado.',
                    [{ text: 'Lamentable' }]
                );
            } catch (e) {
                console.error('Error logging failed session:', e);
            }
        }
    };

    const startSession = async (type: 'SUBJECT' | 'BOOK' = 'SUBJECT') => {
        if (type === 'SUBJECT' && !selectedSubject) return;
        if (type === 'BOOK' && !selectedBook) return;

        const now = Date.now();
        setElapsedSeconds(0);
        setStartTime(now);
        setIsSessionActive(true);
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            startTime: now,
            subjectId: type === 'SUBJECT' ? selectedSubject?.id : undefined,
            bookId: type === 'BOOK' ? selectedBook?.id : undefined,
            type,
            mode: studyMode,
            difficulty,
            targetMinutes
        }));
    };

    const stopSession = async (abandoned = false, skipLog = false, endPage?: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const totalMinutes = Math.floor(elapsedSeconds / 60);
        const start = startTime;
        const subId = selectedSubject?.id;
        const bookId = selectedBook?.id;

        try {
            if (!skipLog && start && (subId || bookId)) {
                await logStudySession({
                    subject_id: subId,
                    book_id: bookId,
                    start_time: new Date(start).toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: abandoned ? 0 : (totalMinutes || 1),
                    mode: studyMode,
                    status: abandoned ? 'ABANDONED' : 'COMPLETED',
                    difficulty: difficulty,
                    notes: abandoned ? 'Abandono voluntario' : 'Éxito'
                });

                // Update Book Progress if applicable
                if (bookId && endPage !== undefined) {
                    await updateBookProgress(bookId, endPage);
                }

                if (!abandoned) {
                    Alert.alert('✨ Misión Cumplida', `Has sumado ${totalMinutes || 1} minutos.`);
                }
            }
        } finally {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            setIsSessionActive(false);
            setElapsedSeconds(0);
            setStartTime(null);
        }
    };

    const addBook = async (title: string, author: string, total_pages: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        // Optimistic UI for adding book (optional but good)
        const idTemp = Math.random().toString(36).substring(7);
        const newBook: Book = {
            id: idTemp,
            title,
            author,
            total_pages,
            current_page: 0,
            cover_color: '#8b4513',
            is_finished: false,
            finished_at: null,
            user_id: user.id,
            created_at: new Date().toISOString()
        };
        setBooks(prev => [newBook, ...prev]);

        const { data, error } = await supabase.from('books').insert([{
            title, author, total_pages, user_id: user.id
        }]).select().single();

        if (error) {
            setBooks(prev => prev.filter(b => b.id !== idTemp));
            throw error;
        }

        // Replace optimistic book with real one
        setBooks(prev => prev.map(b => b.id === idTemp ? data as Book : b));
        return data;
    };

    const updateBookProgress = async (id: string, current_page: number) => {
        const book = books.find(b => b.id === id);
        if (!book) return;

        const isFinished = current_page >= book.total_pages;
        const updates: Partial<Book> = {
            current_page,
            is_finished: isFinished,
            finished_at: isFinished ? (book.finished_at || new Date().toISOString()) : null
        };

        // Optimistic Update
        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

        const { error } = await supabase.from('books').update(updates).eq('id', id);
        if (error) {
            // Rollback
            await fetchSubjects();
            throw error;
        }
    };

    const completeBook = async (id: string) => {
        const book = books.find(b => b.id === id);
        if (!book) return;

        const finishedAt = new Date().toISOString();
        // Optimistic Update
        setBooks(prev => prev.map(b => b.id === id ? {
            ...b,
            is_finished: true,
            current_page: b.total_pages,
            finished_at: finishedAt
        } : b));

        const { error } = await supabase.from('books').update({
            is_finished: true,
            current_page: book.total_pages,
            finished_at: finishedAt
        }).eq('id', id);

        if (error) {
            await fetchSubjects();
            throw error;
        }
    };

    const reactivateBook = async (id: string) => {
        // Optimistic Update
        setBooks(prev => prev.map(b => b.id === id ? { ...b, is_finished: false, finished_at: null } : b));

        const { error } = await supabase.from('books').update({
            is_finished: false,
            finished_at: null
        }).eq('id', id);

        if (error) {
            await fetchSubjects();
            throw error;
        }
    };

    const addSubject = async (name: string, color: string, course?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        const { data, error } = await supabase.from('subjects').insert([{ name, color, course, user_id: user.id }]).select().single();
        if (error) throw error;
        await fetchSubjects();
        return data;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        const { error } = await supabase.from('subjects').update(updates).eq('id', id);
        if (error) throw error;
        await fetchSubjects();
    };

    const completeSubject = async (id: string) => {
        return updateSubject(id, { is_completed: true });
    };

    const reactivateSubject = async (id: string) => {
        return updateSubject(id, { is_completed: false });
    };

    const logStudySession = async (session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { error: sessionError } = await supabase.from('study_sessions').insert([{ ...session, user_id: user.id }]);
        if (sessionError) throw sessionError;

        if (session.status === 'COMPLETED' && session.subject_id) {
            const { data: subject } = await supabase.from('subjects').select('total_minutes_studied').eq('id', session.subject_id).single();
            if (subject) {
                const newTotalSubject = (subject.total_minutes_studied || 0) + session.duration_minutes;
                await updateSubject(session.subject_id, { total_minutes_studied: newTotalSubject });
            }
        }

        if (session.status === 'COMPLETED' && session.book_id) {
            setBookStats(prev => ({
                ...prev,
                [session.book_id as string]: (prev[session.book_id as string] || 0) + session.duration_minutes
            }));
        }

        if (session.status === 'ABANDONED') {
            const { data: profile } = await supabase.from('profiles').select('shame_count').eq('id', user.id).single();
            if (profile) {
                await supabase.from('profiles').update({ shame_count: (profile.shame_count || 0) + 1 }).eq('id', user.id);
            }
        }
        await fetchSubjects();
    };

    return {
        subjects, books, bookStats,
        activeSubjects: subjects.filter(s => !s.is_completed),
        completedSubjects: subjects.filter(s => s.is_completed),
        activeBooks: books
            .filter(b => !b.is_finished)
            .sort((a, b) => {
                const progA = a.current_page / (a.total_pages || 1);
                const progB = b.current_page / (b.total_pages || 1);
                return progB - progA; // Highest percentage on top
            }),
        finishedBooks: books
            .filter(b => b.is_finished)
            .sort((a, b) => {
                const dateA = a.finished_at ? new Date(a.finished_at).getTime() : 0;
                const dateB = b.finished_at ? new Date(b.finished_at).getTime() : 0;
                return dateB - dateA; // Most recent on top
            }),
        loading, error,
        addSubject, updateSubject, completeSubject, reactivateSubject,
        addBook, updateBookProgress, completeBook, reactivateBook,
        logStudySession, refresh: fetchSubjects,
        isSessionActive, startTime, elapsedSeconds, studyMode, setStudyMode, difficulty, setDifficulty,
        targetMinutes, setTargetMinutes,
        selectedSubject, setSelectedSubject,
        selectedBook, setSelectedBook,
        startSession, stopSession, failSession,
    };
};
