import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';
import { usePlatform } from '../services/PlatformContext';
import { WorkoutSession, WorkoutSet } from '../database/models';

const ACTIVE_WORKOUT_KEY = '@omega_active_workout';

export interface LocalWorkoutSet {
    exerciseId: string;
    exerciseName?: string;
    weight: number;
    reps: number;
    rpe?: number;
    type: 'warmup' | 'normal' | 'failure';
}

export interface ActiveWorkoutState {
    startTime: number;
    routineId?: string;
    sets: LocalWorkoutSet[];
}

export const useActiveWorkout = () => {
    const platform = usePlatform();
    const { user, database: db, sync } = useGame();
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [currentSets, setCurrentSets] = useState<LocalWorkoutSet[]>([]);
    const [routineId, setRoutineId] = useState<string | undefined>();
    const [startTime, setStartTime] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const recover = async () => {
            const saved = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
            if (saved) {
                const data: ActiveWorkoutState = JSON.parse(saved);
                setStartTime(data.startTime);
                setRoutineId(data.routineId);
                setCurrentSets(data.sets);
                setIsSessionActive(true);
                setElapsedSeconds(Math.floor((Date.now() - data.startTime) / 1000));
            }
        };
        recover();
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
            const state: ActiveWorkoutState = { startTime, routineId, sets: currentSets };
            AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(state));
        }
    }, [currentSets, isSessionActive, startTime, routineId]);

    const startSession = useCallback(async (selectedRoutineId?: string) => {
        const now = Date.now();
        setStartTime(now);
        setRoutineId(selectedRoutineId);
        setCurrentSets([]);
        setElapsedSeconds(0);
        setIsSessionActive(true);
        setIsResting(false);
        platform.keepAwake.activate();
    }, [platform]);

    const addSet = useCallback((exerciseId: string, weight: number, reps: number, rpe?: number, type: 'warmup' | 'normal' | 'failure' = 'normal') => {
        const newSet: LocalWorkoutSet = { exerciseId, weight, reps, rpe, type };
        setCurrentSets(prev => [...prev, newSet]);
        setIsResting(true);
        platform.haptics.vibrate();
    }, [platform]);

    const finishSession = useCallback(async (note?: string) => {
        if (!isSessionActive || !startTime || !user) return;

        try {
            await db.write(async () => {
                const session = await db.get<WorkoutSession>('workout_sessions').create(s => {
                    s.user_id = user.id;
                    s.routine_id = routineId;
                    s.started_at = startTime;
                    s.ended_at = Date.now();
                    s.note = note || '';
                });

                for (let i = 0; i < currentSets.length; i++) {
                    const s = currentSets[i];
                    await db.get<WorkoutSet>('workout_sets').create(set => {
                        set.session_id = session.id;
                        set.exercise_id = s.exerciseId;
                        set.set_number = i + 1;
                        set.weight_kg = s.weight;
                        set.reps = s.reps;
                        set.rpe = s.rpe;
                        set.type = s.type;
                    });
                }
            });

            await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
            setIsSessionActive(false);
            setStartTime(null);
            setCurrentSets([]);
            platform.keepAwake.deactivate();
            await sync();
        } catch (error) {
            console.error('Error finishing session:', error);
            throw error;
        }
    }, [isSessionActive, startTime, routineId, currentSets, user, sync]);

    return {
        isSessionActive,
        elapsedSeconds,
        isResting,
        setIsResting,
        currentSets,
        startSession,
        addSet,
        finishSession
    };
};
