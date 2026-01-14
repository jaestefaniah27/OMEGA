import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { WorkoutSession, WorkoutSet } from '../types/supabase';
import { useGame } from '../context/GameContext';

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
    const { profile, library } = useGame();
    const { refresh } = library;
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [currentSets, setCurrentSets] = useState<LocalWorkoutSet[]>([]);
    const [routineId, setRoutineId] = useState<string | undefined>();
    const [startTime, setStartTime] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Recovery Logic
    useEffect(() => {
        const recover = async () => {
            const saved = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
            if (saved) {
                const data: ActiveWorkoutState = JSON.parse(saved);
                setStartTime(data.startTime);
                setRoutineId(data.routineId);
                setCurrentSets(data.sets);
                setIsSessionActive(true);
                
                const now = Date.now();
                setElapsedSeconds(Math.floor((now - data.startTime) / 1000));
            }
        };
        recover();
    }, []);

    // 2. Timer Heartbeat
    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                setElapsedSeconds(Math.floor((now - startTime) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, startTime]);

    // 3. Persist state changes
    useEffect(() => {
        if (isSessionActive && startTime) {
            const state: ActiveWorkoutState = {
                startTime,
                routineId,
                sets: currentSets
            };
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
        
        await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({
            startTime: now,
            routineId: selectedRoutineId,
            sets: []
        }));
    }, []);

    const addSet = useCallback((exerciseId: string, weight: number, reps: number, rpe?: number, type: 'warmup' | 'normal' | 'failure' = 'normal') => {
        const newSet: LocalWorkoutSet = { exerciseId, weight, reps, rpe, type };
        setCurrentSets(prev => [...prev, newSet]);
        // Trigger rest timer logic here if UI needs it
        setIsResting(true);
    }, []);

    const finishSession = useCallback(async (note?: string) => {
        if (!isSessionActive || !startTime) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            // 1. Create Session
            const { data: session, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert([{
                    user_id: user.id,
                    routine_id: routineId,
                    started_at: new Date(startTime).toISOString(),
                    ended_at: new Date().toISOString(),
                    bodyweight: profile?.hp_current || 0, // Fallback if no specific bodyweight captured
                    note: note || ''
                }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Create Sets
            const setsToInsert = currentSets.map((s, idx) => ({
                session_id: session.id,
                exercise_id: s.exerciseId,
                set_number: idx + 1,
                weight_kg: s.weight,
                reps: s.reps,
                rpe: s.rpe,
                type: s.type
            }));

            const { error: setsError } = await supabase
                .from('workout_sets')
                .insert(setsToInsert);

            if (setsError) throw setsError;

            // 3. Clear and Refresh
            await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
            setIsSessionActive(false);
            setStartTime(null);
            setCurrentSets([]);
            await refresh(); // Refresh muscle heatmap and other stats
            
        } catch (error) {
            console.error('Error finishing session:', error);
            throw error;
        }
    }, [isSessionActive, startTime, routineId, currentSets, profile, refresh]);

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
