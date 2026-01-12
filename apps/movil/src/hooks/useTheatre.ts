import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
    TheatreActivity,
    TheatreMovie,
    TheatreSeries,
    TheatreSeason,
    StudySession
} from '../types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEATRE_SESSION_STORAGE_KEY = 'theatre_active_session';

export const useTheatre = () => {
    const [activities, setActivities] = useState<TheatreActivity[]>([]);
    const [movies, setMovies] = useState<TheatreMovie[]>([]);
    const [series, setSeries] = useState<(TheatreSeries & { seasons: TheatreSeason[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Activity Stats: { activityId: { totalMinutes: number, daysCount: number } }
    const [activityStats, setActivityStats] = useState<Record<string, { totalMinutes: number, daysCount: number }>>({});

    // Session State (Similar to useLibrary)
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<TheatreActivity | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [
                { data: actData, error: actError },
                { data: movData, error: movError },
                { data: serData, error: serError },
                { data: seasData, error: seasError },
                { data: sessData, error: sessError }
            ] = await Promise.all([
                supabase.from('theatre_activities').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_movies').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_series').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_seasons').select('*').order('season_number', { ascending: true }),
                supabase.from('study_sessions').select('activity_id, duration_minutes, created_at').not('activity_id', 'is', null).eq('user_id', user.id)
            ]);

            if (actError) throw actError;
            if (movError) throw movError;
            if (serError) throw serError;
            if (seasError) throw seasError;
            if (sessError) throw sessError;

            // Process Series & Seasons
            const seriesWithSeasons = (serData || []).map(s => ({
                ...s,
                seasons: (seasData || []).filter(season => season.series_id === s.id)
            }));

            // Process Activity Stats from the new columns
            const finalStats: Record<string, { totalMinutes: number, daysCount: number }> = {};
            (actData || []).forEach(act => {
                finalStats[act.id] = {
                    totalMinutes: act.total_minutes || 0,
                    daysCount: act.days_count || 0
                };
            });

            setActivities(actData || []);
            setMovies(movData || []);
            setSeries(seriesWithSeasons);
            setActivityStats(finalStats);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Session Recovery
        const recoverSession = async () => {
            const saved = await AsyncStorage.getItem(THEATRE_SESSION_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                const start = new Date(data.startTime);
                setStartTime(start);
                setElapsedSeconds(Math.floor((new Date().getTime() - start.getTime()) / 1000));
                setIsSessionActive(true);
                // We'll need to fetch activities first to find the selected one
                // This is a bit tricky with async, might need activities in deps or another effect
            }
        };
        recoverSession();
    }, []);

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

    // CRUD Methods
    const addActivity = async (name: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data, error } = await supabase.from('theatre_activities').insert([{ name, user_id: user.id }]).select().single();
        if (error) throw error;
        await fetchData();
        return data;
    };

    const addMovie = async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data, error } = await supabase.from('theatre_movies').insert([{
            title, director, saga, comment, rating, user_id: user.id
        }]).select().single();
        if (error) throw error;
        await fetchData();
        return data;
    };

    const addSeries = async (title: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data, error } = await supabase.from('theatre_series').insert([{ title, user_id: user.id }]).select().single();
        if (error) throw error;
        await fetchData();
        return data;
    };

    const addSeason = async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        const { error } = await supabase.from('theatre_seasons').insert([{
            series_id, season_number, episodes_count, comment, rating
        }]);
        if (error) throw error;
        await fetchData();
    };

    const updateActivity = async (id: string, name: string) => {
        const { error } = await supabase.from('theatre_activities').update({ name }).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        const { error } = await supabase.from('theatre_movies').update(updates).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const updateSeries = async (id: string, title: string) => {
        const { error } = await supabase.from('theatre_series').update({ title }).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        const { error } = await supabase.from('theatre_seasons').update(updates).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    // Session Methods
    const startSession = async (activity: TheatreActivity) => {
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

    const stopSession = async (abandoned = false, skipLog = false, endPage?: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!startTime || !selectedActivity) return;

        try {
            const totalMinutes = Math.floor(elapsedSeconds / 60);
            const start = startTime;
            if (totalMinutes < 1 && !abandoned) {
                // Too short - do not log anything
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error: sessError } = await supabase.from('study_sessions').insert([{
                    user_id: user.id,
                    activity_id: selectedActivity.id,
                    start_time: startTime.toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: totalMinutes,
                    mode: 'STOPWATCH',
                    status: 'COMPLETED',
                    difficulty: 'EXPLORER' // Default for theater
                }]);
                if (sessError) console.error('Error saving session:', sessError);

                // Update Theatre Activity Stats
                // First, get all sessions for this activity to count unique days
                const { data: allSessions } = await supabase
                    .from('study_sessions')
                    .select('created_at')
                    .eq('activity_id', selectedActivity.id);

                const daysSet = new Set((allSessions || []).map(s => new Date(s.created_at).toISOString().split('T')[0]));
                const newMinutes = (selectedActivity.total_minutes || 0) + totalMinutes;
                const newDays = daysSet.size;

                const { error: actError } = await supabase
                    .from('theatre_activities')
                    .update({
                        total_minutes: newMinutes,
                        days_count: newDays
                    })
                    .eq('id', selectedActivity.id);

                if (actError) console.error('Error updating activity stats:', actError);
            }
        } catch (err: any) {
            console.error('StopSession crashed:', err);
        } finally {
            setIsSessionActive(false);
            setStartTime(null);
            setElapsedSeconds(0);
            setSelectedActivity(null);
            await AsyncStorage.removeItem(THEATRE_SESSION_STORAGE_KEY);
            await fetchData();
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
        addActivity, addMovie, addSeries, addSeason,
        updateActivity, updateMovie, updateSeries, updateSeason,
        startSession, stopSession, cancelSession, fetchData,
        setSelectedActivity
    };
};
