import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';
import { useWorkout } from '../hooks/useWorkout';
import { useToast } from '../context/ToastContext';
import { usePlatform } from '../services/PlatformContext';
import { Q } from '@nozbe/watermelondb';
import { Book, Subject, StudySession, CustomColor } from '../database/models';

const SESSION_STORAGE_KEY = '@omega_active_session';

export const useLibrary = () => {
    const platform = usePlatform();
    const { user, database: db, sync } = useGame();
    const { isSessionActive: isWorkoutActive } = useWorkout();
    const { showToast } = useToast();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync state with WatermelonDB
    useEffect(() => {
        if (!user) return;
        const subSub = db.get<Subject>('subjects').query(Q.where('user_id', user.id)).observe().subscribe(s => {
            setSubjects(s);
            setLoading(false);
        });
        const bookSub = db.get<Book>('books').query(Q.where('user_id', user.id)).observe().subscribe(setBooks);
        return () => {
            subSub.unsubscribe();
            bookSub.unsubscribe();
        };
    }, [user]);

    const ctxUpdateBook = async (id: string, updates: any) => {
        await db.write(async () => {
            const book = await db.get<Book>('books').find(id);
            await book.update(b => {
                Object.assign(b, updates);
            });
        });
    };

    const ctxUpdateSubject = async (id: string, updates: any) => {
        await db.write(async () => {
            const subject = await db.get<Subject>('subjects').find(id);
            await subject.update(s => {
                if (updates.name !== undefined) s.name = updates.name;
                if (updates.color !== undefined) s.color = updates.color;
                if (updates.course !== undefined) s.course = updates.course;
                if (updates.total_minutes_studied !== undefined) s.total_minutes_studied = updates.total_minutes_studied;
                if (updates.is_completed !== undefined) s.is_completed = updates.is_completed;
                if (updates.final_grade !== undefined) s.final_grade = updates.final_grade;
                if (updates.exams !== undefined) s.exams = updates.exams;
            });
        });
    };

    const ctxAddSubject = async (name: string, color: string, course?: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<Subject>('subjects').create(s => {
                s.user_id = user.id;
                s.name = name;
                s.color = color;
                s.course = course || undefined;
            });
        });
    };

    const ctxAddBook = async (book: any) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<Book>('books').create(b => {
                b.user_id = user.id;
                b.title = book.title;
                b.author = book.author || '';
                b.total_pages = book.total_pages || 0;
                b.current_page = 0;
                b.cover_color = book.cover_color || '#8b4513';
                b.saga = book.saga;
                b.saga_index = book.saga_index || 0;
                b.is_finished = false;
            });
        });
    };

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
    const [activeSessionType, setActiveSessionType] = useState<'SUBJECT' | 'BOOK' | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const init = async () => {
            await platform.notifications.requestPermissions();
            const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            if (saved) {
                const sessionData = JSON.parse(saved);
                setStartTime(sessionData.startTime);
                setStudyMode(sessionData.mode);
                setDifficulty(sessionData.difficulty);
                setTargetMinutes(sessionData.targetMinutes);
                setActiveSessionType(sessionData.type || null);
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

            if (!selectedSubject && subjects.length > 0) {
                const sub = subjects.find(s => s.id === recoveredSubjectId);
                if (sub) setSelectedSubject(sub);
                else if (!isSessionActive) setSelectedSubject(subjects.filter(s => !s.is_completed)[0] || null);
            }

            if (!selectedBook && books.length > 0) {
                const book = books.find(b => b.id === recoveredBookId);
                if (book) setSelectedBook(book);
                else if (!isSessionActive) {
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

    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedSeconds(elapsed);
                if (studyMode === 'TIMER') {
                    const targetSecs = parseInt(targetMinutes) * 60;
                    if (elapsed === targetSecs) platform.notifications.scheduleNotification('⌛ ¡Tiempo Cumplido!', 'Has alcanzado tu objetivo de estudio.');
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, startTime, studyMode, targetMinutes]);

    const logStudySession = async (session: any) => {
        if (!user) throw new Error('Usuario no autenticado');
        await db.write(async () => {
            await db.get<StudySession>('study_sessions').create(s => {
                s.user_id = user.id;
                s.subject_id = session.subjectId;
                s.book_id = session.bookId;
                s.start_time = session.startTime;
                s.end_time = session.endTime;
                s.duration_minutes = session.durationMinutes;
                s.status = session.status;
                s.difficulty = session.difficulty;
                s.mode = session.mode;
            });
        });

        if (session.status === 'COMPLETED' && session.subjectId) {
            const subject = subjects.find(s => s.id === session.subjectId);
            if (subject) await ctxUpdateSubject(subject.id, { total_minutes_studied: (subject.total_minutes_studied || 0) + session.durationMinutes });
        }
    };

    const startSession = async (type: 'SUBJECT' | 'BOOK' = 'SUBJECT') => {
        if (isWorkoutActive) {
            Alert.alert("⚠️ Batalla en Curso", "No puedes estudiar ni leer mientras estás en la Forja Táctica.");
            return;
        }
        if (type === 'SUBJECT' && !selectedSubject) return;
        if (type === 'BOOK' && !selectedBook) return;

        const now = Date.now();
        setElapsedSeconds(0);
        setStartTime(now);
        setIsSessionActive(true);
        setActiveSessionType(type);
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            startTime: now,
            subjectId: type === 'SUBJECT' ? selectedSubject?.id : undefined,
            bookId: type === 'BOOK' ? selectedBook?.id : undefined,
            type, mode: studyMode, difficulty, targetMinutes
        }));
    };

    const stopSession = async (abandoned = false, skipLog = false, endPage?: number) => {
        const totalMinutes = Math.floor(elapsedSeconds / 60);
        if (totalMinutes < 1 && !abandoned && !skipLog) {
            Alert.alert("⏳ Tiempo Insuficiente", "¿Deseas salir de todos modos?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir sin guardar", style: "destructive", onPress: () => finalizeStop(abandoned, true, endPage) }
            ]);
            return;
        }
        await finalizeStop(abandoned, skipLog, endPage);
    };

    const finalizeStop = async (abandoned = false, skipLog = false, endPage?: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const totalMinutes = Math.floor(elapsedSeconds / 60);
        const start = startTime;
        const subId = selectedSubject?.id;
        const bookId = selectedBook?.id;
        setIsSessionActive(false);
        setElapsedSeconds(0);
        setStartTime(null);
        setActiveSessionType(null);
        AsyncStorage.removeItem(SESSION_STORAGE_KEY).catch(console.error);

        if (!skipLog && start && (subId || bookId)) {
            await logStudySession({
                subjectId: subId,
                bookId: bookId,
                startTime: new Date(start).toISOString(),
                endTime: new Date().toISOString(),
                duration_minutes: abandoned ? 0 : totalMinutes,
                mode: studyMode,
                status: abandoned ? 'ABANDONED' : 'COMPLETED',
                difficulty,
                notes: abandoned ? 'Abandono' : 'Éxito'
            });
            if (bookId && endPage !== undefined) {
                await ctxUpdateBook(bookId, { current_page: endPage, is_finished: endPage >= (selectedBook?.total_pages || 1) });
            }
            if (!abandoned) showToast(`✨ Misión Cumplida: +${totalMinutes} min`, 'success');
        }
    };

    const [customColors, setCustomColors] = useState<CustomColor[]>([]);
    const [bookStats, setBookStats] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!user) return;
        const colorSub = db.get<CustomColor>('custom_colors').query(Q.where('user_id', user.id)).observe().subscribe(setCustomColors);
        const sessionSub = db.get<StudySession>('study_sessions').query(Q.where('user_id', user.id), Q.where('status', 'COMPLETED')).observe().subscribe(sessions => {
            const stats: Record<string, number> = {};
            sessions.forEach(s => {
                if (s.book_id) {
                    stats[s.book_id] = (stats[s.book_id] || 0) + s.duration_minutes;
                }
            });
            setBookStats(stats);
        });
        return () => {
            colorSub.unsubscribe();
            sessionSub.unsubscribe();
        };
    }, [user]);

    const saveCustomColor = async (color: string) => {
        if (!user) return;
        await db.write(async () => {
            await db.get<CustomColor>('custom_colors').create(c => {
                c.user_id = user.id;
                c.hex_code = color;
            });
        });
    };

    const completeSubject = async (id: string) => {
        await ctxUpdateSubject(id, { is_completed: true });
        showToast('🏆 ¡Asignatura Concluida!', 'success');
    };

    const reactivateSubject = async (id: string) => {
        await ctxUpdateSubject(id, { is_completed: false });
    };

    const deleteSubject = async (id: string) => {
        await db.write(async () => {
            const subject = await db.get<Subject>('subjects').find(id);
            await subject.markAsDeleted();
        });
    };

    const completeBook = async (id: string) => {
        const book = books.find(b => b.id === id);
        if (book) await ctxUpdateBook(id, { is_finished: true, current_page: book.total_pages });
        showToast('📖 ¡Libro Completado!', 'success');
    };

    const reactivateBook = async (id: string) => {
        await ctxUpdateBook(id, { is_finished: false, current_page: 0 });
    };

    const deleteBook = async (id: string) => {
        await db.write(async () => {
            const book = await db.get<Book>('books').find(id);
            await book.markAsDeleted();
        });
    };

    const updateBookProgress = async (id: string, page: number) => {
        const book = books.find(b => b.id === id);
        if (book) {
            await ctxUpdateBook(id, {
                current_page: page,
                is_finished: page >= book.total_pages
            });
        }
    };

    const updatePage = async (id: string, page: number) => {
        await updateBookProgress(id, page);
    };

    const enrichedSubjects = subjects.map(s => {
        if (!s || !s.id) return null;
        let parsedExams = [];
        try {
            const rawExams = (s as any).exams || (s as any)._raw?.exams;
            parsedExams = rawExams ? JSON.parse(rawExams) : [];
        } catch (e) {
            console.error('Failed to parse exams for subject', s.id, e);
        }
        return {
            id: s.id,
            user_id: s.user_id,
            name: s.name,
            color: s.color,
            course: s.course,
            total_minutes_studied: s.total_minutes_studied,
            is_completed: s.is_completed,
            final_grade: s.final_grade,
            exams: parsedExams
        };
    }).filter(Boolean);

    return {
        subjects: enrichedSubjects as any[],
        books,
        activeSubjects: enrichedSubjects.filter(s => !s.is_completed) as any[],
        completedSubjects: enrichedSubjects.filter(s => s.is_completed) as any[],
        activeBooks: books.filter(b => !b.is_finished),
        finishedBooks: books.filter(b => b.is_finished),
        loading,
        error,
        addSubject: ctxAddSubject,
        updateSubject: ctxUpdateSubject,
        completeSubject,
        reactivateSubject,
        deleteSubject,
        addBook: ctxAddBook,
        updateBook: ctxUpdateBook,
        completeBook,
        reactivateBook,
        deleteBook,
        updateBookProgress,
        updatePage,
        isSessionActive,
        startTime,
        elapsedSeconds,
        studyMode,
        setStudyMode,
        difficulty,
        setDifficulty,
        selectedSubject,
        setSelectedSubject,
        selectedBook,
        setSelectedBook,
        activeSessionType,
        startSession,
        stopSession,
        refresh: sync,
        bookStats,
        customColors,
        saveCustomColor,
        targetMinutes,
        setTargetMinutes
    };
};
