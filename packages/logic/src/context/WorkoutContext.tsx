import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from './GameContext';
import { useToast } from './ToastContext';
import { WorkoutSession, WorkoutSet } from '../database/models';

const WORKOUT_STORAGE_KEY = '@omega_active_workout_v2';

interface WorkoutContextType {
    isSessionActive: boolean;
    elapsedSeconds: number;
    formatTime: string;
    setsLog: any[];
    startSession: (routineId: string | null, exercises: any[]) => Promise<void>;
    finishSession: () => Promise<boolean>;
    addSet: (exerciseId: string, exerciseName: string) => void;
    updateSet: (id: string, updates: Partial<any>) => void;
    removeSet: (id: string) => void;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const { user, database: db, sync } = useGame();
    const { showToast } = useToast();

    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [workoutRoutineId, setWorkoutRoutineId] = useState<string | null>(null);
    const [setsLog, setSetsLog] = useState<any[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadWorkout = async () => {
            const saved = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                setStartTime(data.startTime);
                setWorkoutRoutineId(data.routineId);
                setSetsLog(data.sets);
                setIsSessionActive(true);
                setElapsedSeconds(Math.floor((Date.now() - data.startTime) / 1000));
            }
        };
        loadWorkout();
    }, []);

    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
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
        const now = Date.now();
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
        if (!isSessionActive || !startTime || !user) return false;
        const completedSets = setsLog.filter(s => s.completed);

        if (completedSets.length === 0) {
            return new Promise<boolean>((resolve) => {
                Alert.alert("Aviso", "¿Terminar sin registrar nada?", [
                    { text: "No", style: "cancel", onPress: () => resolve(false) },
                    {
                        text: "Sí, abandonar", style: "destructive", onPress: async () => {
                            await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);
                            setIsSessionActive(false);
                            setStartTime(null);
                            setSetsLog([]);
                            resolve(true);
                        }
                    }
                ]);
            });
        }

        try {
            const totalVolume = completedSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);

            await db.write(async () => {
                const session = await db.get<WorkoutSession>('workout_sessions').create(s => {
                    s.user_id = user.id;
                    s.routine_id = workoutRoutineId || undefined;
                    s.started_at = startTime;
                    s.ended_at = Date.now();
                    s.note = `Volumen: ${totalVolume}kg`;
                });

                for (let i = 0; i < completedSets.length; i++) {
                    const s = completedSets[i];
                    await db.get<WorkoutSet>('workout_sets').create(set => {
                        set.session_id = session.id;
                        set.exercise_id = s.exercise_id;
                        set.set_number = i + 1;
                        set.weight_kg = s.weight;
                        set.reps = s.reps;
                        set.type = s.type;
                    });
                }
            });

            await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);
            setIsSessionActive(false);
            setStartTime(null);
            setSetsLog([]);

            showToast(`¡Batalla Concluida! Daño: ${totalVolume}kg`, 'success');
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

    return (
        <WorkoutContext.Provider value={{
            isSessionActive,
            elapsedSeconds,
            formatTime: formatTime(elapsedSeconds),
            setsLog,
            startSession,
            finishSession,
            addSet,
            updateSet,
            removeSet
        }}>
            {children}
        </WorkoutContext.Provider>
    );
};
