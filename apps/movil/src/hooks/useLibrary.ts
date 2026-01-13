import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { Subject, StudySession, Book, CustomColor } from '../types/supabase';
import { useGame } from '../context/GameContext';

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
    // --- CONSUME CONTEXT ---
    const { library } = useGame();
    const {
        subjects,
        books,
        customColors,
        bookStats,
        loading,
        refresh,
        addSubject: ctxAddSubject,
        updateSubject: ctxUpdateSubject,
        addBook: ctxAddBook,
        updateBook: ctxUpdateBook,
        saveCustomColor: ctxSaveCustomColor
    } = library;

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

    // 1. Initial Load (Recovery only, data comes from Context)
    useEffect(() => {
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
        };

        init();
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

                    // Schedule Epic Warning
                    console.log('Iron Will [V5]: Programando aviso épico (Unified ID) para dentro de 10s...');
                    Notifications.scheduleNotificationAsync({
                        identifier: 'iron-will-main-alert',
                        content: {
                            title: '¡EL JUICIO FINAL SE ACERCA! ⚖️',
                            subtitle: '🔥 ÚLTIMA OPORTUNIDAD 🔥',
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
            if (totalMinutes < 1 && !abandoned && !skipLog) {
                return;
            }
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
                    await ctxUpdateBook(bookId, {
                        current_page: endPage,
                        is_finished: false, // Will be checked in next step if necessary, but context updateBook is generic
                    });

                    // We need to check if finished. Access book from 'books'
                    const liveBook = books.find(b => b.id === bookId);
                    if (liveBook && endPage >= liveBook.total_pages) {
                        await ctxUpdateBook(bookId, {
                            is_finished: true,
                            finished_at: liveBook.finished_at || new Date().toISOString()
                        });
                    }
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

    const logStudySession = async (session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { error: sessionError } = await supabase.from('study_sessions').insert([{ ...session, user_id: user.id }]);
        if (sessionError) throw sessionError;

        if (session.status === 'COMPLETED' && session.subject_id) {
            // Fetch latest subject data to update total minutes
            // We use ctxUpdateSubject which will handle optimistic update in context if we wanted, 
            // but here we just need to push the new total to DB.
            // Actually, we should get the current total from the 'subjects' array in context!
            const subject = subjects.find(s => s.id === session.subject_id);
            if (subject) {
                const newTotalSubject = (subject.total_minutes_studied || 0) + session.duration_minutes;
                await ctxUpdateSubject(session.subject_id, { total_minutes_studied: newTotalSubject });
            }
        }

        if (session.status === 'ABANDONED') {
            const { data: profile } = await supabase.from('profiles').select('shame_count').eq('id', user.id).single();
            if (profile) {
                await supabase.from('profiles').update({ shame_count: (profile.shame_count || 0) + 1 }).eq('id', user.id);
            }
        }

        // Refresh context to pull new session data (for stats)
        await refresh();
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
                return progB - progA;
            }),
        finishedBooks: books
            .filter(b => b.is_finished)
            .sort((a, b) => {
                const dateA = a.finished_at ? new Date(a.finished_at).getTime() : 0;
                const dateB = b.finished_at ? new Date(b.finished_at).getTime() : 0;
                return dateB - dateA;
            }),
        loading, error,
        addSubject: ctxAddSubject,
        updateSubject: ctxUpdateSubject,
        addBook: ctxAddBook,
        updateBook: ctxUpdateBook,
        saveCustomColor: ctxSaveCustomColor,
        customColors,
        // Wrappers or Aliases
        completeSubject: (id: string) => ctxUpdateSubject(id, { is_completed: true }),
        reactivateSubject: (id: string) => ctxUpdateSubject(id, { is_completed: false }),
        completeBook: (id: string) => ctxUpdateBook(id, { is_finished: true, finished_at: new Date().toISOString() }),
        reactivateBook: (id: string) => ctxUpdateBook(id, { is_finished: false, finished_at: null }),
        updateBookProgress: (id: string, current_page: number) => {
            // Logic to check finished is moved to stopSession or needs to be here? 
            // The original used updateBookProgress.
            // We can check finished state here too.
            const book = books.find(b => b.id === id);
            if (!book) return Promise.resolve();
            const isFinished = current_page >= book.total_pages;
            return ctxUpdateBook(id, {
                current_page,
                is_finished: isFinished,
                finished_at: isFinished ? (book.finished_at || new Date().toISOString()) : null
            });
        },
        logStudySession,
        refresh,
        isSessionActive, startTime, elapsedSeconds, studyMode, setStudyMode, difficulty, setDifficulty,
        targetMinutes, setTargetMinutes,
        selectedSubject, setSelectedSubject,
        selectedBook, setSelectedBook,
        startSession, stopSession, failSession,
    };
};
