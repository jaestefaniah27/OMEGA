import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import {
    TheatreActivity,
    TheatreMovie,
    TheatreSeries,
    TheatreSeason
} from '../types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

const THEATRE_SESSION_STORAGE_KEY = 'theatre_active_session';

export const useTheatre = () => {
    // --- CONSUME CONTEXT ---
    const { theatre, workout, castle, habits: habitCtx } = useGame();
    const { showToast } = useToast();
    const {
        activities,
        movies,
        series,
        activityStats,
        loading,
        refresh,
        addActivity: ctxAddActivity,
        updateActivity: ctxUpdateActivity, // This only handles name updates currently
        addMovie: ctxAddMovie,
        updateMovie: ctxUpdateMovie,
        addSeries: ctxAddSeries,
        updateSeries: ctxUpdateSeries, // This only handles title currently
        addSeason: ctxAddSeason,
        updateSeason: ctxUpdateSeason
    } = theatre;

    const [error, setError] = useState<string | null>(null);

    // Session State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<TheatreActivity | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Session Recovery
        const recoverSession = async () => {
            const saved = await AsyncStorage.getItem(THEATRE_SESSION_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                const start = new Date(data.startTime);
                setStartTime(start);
                setElapsedSeconds(Math.floor((new Date().getTime() - start.getTime()) / 1000));
                setIsSessionActive(true);

                // Find selected activity from context data
                // We depend on activities being loaded. 
                // Since context loads on mount, they might be here or coming.
                // We can set it when activities change if we have an ID.
                if (data.activityId && activities.length > 0) {
                    const act = activities.find(a => a.id === data.activityId);
                    if (act) setSelectedActivity(act);
                }
            }
        };
        recoverSession();
    }, [activities]); // Depend on activities to restore selection once loaded

    // Timer Heartbeat
    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionActive, startTime]);

    // Wrappers for Context Mutations
    const addActivity = (name: string) => ctxAddActivity(name);

    // We generalize updateActivity in the hook to allow partial updates (stats) via direct DB call if needed, 
    // but the context exposes specific ones. 
    // The UI currently only updates name.
    const updateActivity = (id: string, name: string) => ctxUpdateActivity(id, name);

    const addMovie = (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) =>
        ctxAddMovie(title, director, saga, comment, rating);

    const updateMovie = (id: string, updates: Partial<TheatreMovie>) => ctxUpdateMovie(id, updates);

    const addSeries = (title: string) => ctxAddSeries(title);

    const updateSeries = (id: string, title: string) => ctxUpdateSeries(id, title);

    const addSeason = (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) =>
        ctxAddSeason(series_id, season_number, episodes_count, comment, rating);

    const updateSeason = (id: string, updates: Partial<TheatreSeason>) => ctxUpdateSeason(id, updates);

    // Session Methods
    const startSession = async (activity: TheatreActivity) => {
        if (workout.isSessionActive) {
            Alert.alert("⚠️ Batalla en Curso", "No puedes realizar actividades en el Teatro mientras estás en la Forja Táctica. ¡Termina tu entrenamiento primero!");
            return;
        }
        const start = new Date();
        setStartTime(start);
        setSelectedActivity(activity);
        setIsSessionActive(true);
        setElapsedSeconds(0);
        await AsyncStorage.setItem(THEATRE_SESSION_STORAGE_KEY, JSON.stringify({
            startTime: start.toISOString(),
            activityId: activity.id
        }));
    };

    const stopSession = async (abandoned = false) => {
        const totalMinutes = Math.floor(elapsedSeconds / 60);

        if (totalMinutes < 1 && !abandoned) {
            Alert.alert(
                "⏳ Tiempo Insuficiente",
                "Las sesiones de menos de un minuto no se registran. ¿Deseas salir de todos modos?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Salir sin guardar",
                        style: "destructive",
                        onPress: () => finalizeStop(true)
                    }
                ]
            );
            return;
        }

        await finalizeStop(abandoned);
    };

    const finalizeStop = async (abandoned = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!startTime || !selectedActivity) return;

        try {
            const totalMinutes = Math.floor(elapsedSeconds / 60);

            // --- OPTIMISTIC RESET ---
            setIsSessionActive(false);
            setStartTime(null);
            setElapsedSeconds(0);
            setSelectedActivity(null);
            AsyncStorage.removeItem(THEATRE_SESSION_STORAGE_KEY).catch(console.error);

            if (totalMinutes < 1 && !abandoned) {
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error: sessError } = await supabase.from('study_sessions').insert([{
                    user_id: user.id,
                    activity_id: selectedActivity.id,
                    start_time: startTime.toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: abandoned ? 0 : totalMinutes,
                    mode: 'STOPWATCH',
                    status: abandoned ? 'ABANDONED' : 'COMPLETED',
                    difficulty: 'EXPLORER'
                }]);
                if (sessError) console.error('Error saving session:', sessError);

                if (!abandoned) {
                    const { data: allSessions } = await supabase
                        .from('study_sessions')
                        .select('created_at')
                        .eq('activity_id', selectedActivity.id);

                    const daysSet = new Set((allSessions || []).map(s => new Date(s.created_at).toISOString().split('T')[0]));
                    const newMinutes = (selectedActivity.total_minutes || 0) + totalMinutes;
                    const newDays = daysSet.size;

                    await supabase
                        .from('theatre_activities')
                        .update({
                            total_minutes: newMinutes,
                            days_count: newDays
                        })
                        .eq('id', selectedActivity.id);

                    await castle.checkDecreeProgress('THEATRE', selectedActivity.id, 1, totalMinutes, 'THEATRE');
                    showToast(`✨ Maestría: +${totalMinutes} min`, 'success');
                    await refresh();
                }
            }
        } catch (err: any) {
            console.error('FinalizeStop crashed:', err);
        }
    };

    const cancelSession = async () => {
        setIsSessionActive(false);
        setStartTime(null);
        setElapsedSeconds(0);
        setSelectedActivity(null);
        await AsyncStorage.removeItem(THEATRE_SESSION_STORAGE_KEY);
    };

    return {
        activities, movies, series, loading, error, activityStats,
        isSessionActive, startTime, elapsedSeconds, selectedActivity,
        setSelectedActivity,
        addActivity, addMovie, addSeries, addSeason,
        updateActivity, updateMovie, updateSeries, updateSeason,
        startSession, stopSession, cancelSession, fetchData: refresh, // Alias refresh to fetchData for compat
        habits: habitCtx
    };
};
