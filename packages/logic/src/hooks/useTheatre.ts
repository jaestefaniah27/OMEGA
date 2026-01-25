import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';
import { useWorkout } from '../hooks/useWorkout';
import { useToast } from '../context/ToastContext';
import { Q } from '@nozbe/watermelondb';
import { TheatreActivity, TheatreMovie, TheatreSeries, TheatreSeason, StudySession } from '../database/models';

const THEATRE_SESSION_STORAGE_KEY = 'theatre_active_session';

export const useTheatre = () => {
    const { user, database: db, sync } = useGame();
    const { isSessionActive: isWorkoutActive } = useWorkout();
    const { showToast } = useToast();

    const [activities, setActivities] = useState<TheatreActivity[]>([]);
    const [movies, setMovies] = useState<TheatreMovie[]>([]);
    const [series, setSeries] = useState<TheatreSeries[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Session State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<TheatreActivity | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) return;

        const actSub = db.get<TheatreActivity>('theatre_activities')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(records => {
                setActivities(records);
                setLoading(false);
            });

        const movSub = db.get<TheatreMovie>('theatre_movies')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(setMovies);

        const seriesSub = db.get<TheatreSeries>('theatre_series')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(setSeries);

        return () => {
            actSub.unsubscribe();
            movSub.unsubscribe();
            seriesSub.unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        const recoverSession = async () => {
            const saved = await AsyncStorage.getItem(THEATRE_SESSION_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                const start = new Date(data.startTime);
                setStartTime(start);
                setElapsedSeconds(Math.floor((new Date().getTime() - start.getTime()) / 1000));
                setIsSessionActive(true);

                if (data.activityId && activities.length > 0) {
                    const act = activities.find(a => a.id === data.activityId);
                    if (act) setSelectedActivity(act);
                }
            }
        };
        recoverSession();
    }, [activities]);

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

    // Mutations
    const addActivity = async (name: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<TheatreActivity>('theatre_activities').create(a => {
                a.user_id = user.id;
                a.name = name;
                a.total_minutes = 0;
                a.days_count = 0;
            });
        });
    };

    const updateActivity = async (id: string, name: string) => {
        await db.write(async () => {
            const record = await db.get<TheatreActivity>('theatre_activities').find(id);
            await record.update(a => {
                a.name = name;
            });
        });
    };

    const addMovie = async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<TheatreMovie>('theatre_movies').create(m => {
                m.user_id = user.id;
                m.title = title;
                m.director = director;
                m.saga = saga;
                m.comment = comment;
                m.rating = rating;
            });
        });
    };

    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        await db.write(async () => {
            const record = await db.get<TheatreMovie>('theatre_movies').find(id);
            await record.update(m => {
                Object.assign(m, updates);
            });
        });
    };

    const addSeries = async (title: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<TheatreSeries>('theatre_series').create(s => {
                s.user_id = user.id;
                s.title = title;
            });
        });
    };

    const updateSeries = async (id: string, title: string) => {
        await db.write(async () => {
            const record = await db.get<TheatreSeries>('theatre_series').find(id);
            await record.update(s => {
                s.title = title;
            });
        });
    };

    const addSeason = async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        return await db.write(async () => {
            return await db.get<TheatreSeason>('theatre_seasons').create(s => {
                s.series_id = series_id;
                s.season_number = season_number;
                s.episodes_count = episodes_count || 0;
                s.comment = comment;
                s.rating = rating;
            });
        });
    };

    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        await db.write(async () => {
            const record = await db.get<TheatreSeason>('theatre_seasons').find(id);
            await record.update(s => {
                Object.assign(s, updates);
            });
        });
    };

    const startSession = async (activity: TheatreActivity) => {
        if (isWorkoutActive) {
            Alert.alert("⚠️ Batalla en Curso", "Termina tu entrenamiento primero!");
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
            Alert.alert("⏳ Tiempo Insuficiente", "Salir sin guardar?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir sin guardar", style: "destructive", onPress: () => finalizeStop(true) }
            ]);
            return;
        }
        await finalizeStop(abandoned);
    };

    const finalizeStop = async (abandoned = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!startTime || !selectedActivity || !user) return;

        try {
            const totalMinutes = Math.floor(elapsedSeconds / 60);
            setIsSessionActive(false);
            setStartTime(null);
            setElapsedSeconds(0);
            setSelectedActivity(null);
            AsyncStorage.removeItem(THEATRE_SESSION_STORAGE_KEY).catch(console.error);

            if (totalMinutes < 1 && !abandoned) return;

            await db.write(async () => {
                await db.get<StudySession>('study_sessions').create(s => {
                    s.user_id = user.id;
                    s.activity_id = selectedActivity.id;
                    s.start_time = startTime.toISOString();
                    s.end_time = new Date().toISOString();
                    s.duration_minutes = abandoned ? 0 : totalMinutes;
                    s.status = abandoned ? 'ABANDONED' : 'COMPLETED';
                    s.mode = 'STOPWATCH';
                    s.difficulty = 'EXPLORER';
                });

                if (!abandoned) {
                    const activity = await db.get<TheatreActivity>('theatre_activities').find(selectedActivity.id);
                    await activity.update(a => {
                        a.total_minutes = (a.total_minutes || 0) + totalMinutes;
                        // days_count update logic would ideally be complex, but let's keep it simple for now
                        // since we can't easily count distinct dates in Watermelon observers without a query
                    });
                }
            });

            if (!abandoned) {
                showToast(`✨ Maestría: +${totalMinutes} min`, 'success');
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

    const [seasons, setSeasons] = useState<TheatreSeason[]>([]);
    const [activityStats, setActivityStats] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!user) return;

        const seasonsSub = db.get<TheatreSeason>('theatre_seasons').query().observe().subscribe(setSeasons);

        const sessionSub = db.get<StudySession>('study_sessions')
            .query(Q.where('user_id', user.id), Q.where('status', 'COMPLETED'))
            .observe()
            .subscribe(sessions => {
                const stats: Record<string, number> = {};
                sessions.forEach(s => {
                    if (s.activity_id) {
                        stats[s.activity_id] = (stats[s.activity_id] || 0) + s.duration_minutes;
                    }
                });
                setActivityStats(stats);
            });

        return () => {
            seasonsSub.unsubscribe();
            sessionSub.unsubscribe();
        };
    }, [user]);

    const enrichedSeries = series.map(ser => ({
        ...ser,
        seasons: seasons.filter(s => s.series_id === ser.id)
    }));

    return {
        activities,
        movies,
        series: enrichedSeries,
        loading,
        error,
        activityStats,
        isSessionActive,
        startTime,
        elapsedSeconds,
        selectedActivity,
        setSelectedActivity,
        addActivity,
        addMovie,
        addSeries,
        addSeason,
        updateActivity,
        updateMovie,
        updateSeries,
        updateSeason,
        startSession,
        stopSession,
        cancelSession,
        fetchData: sync
    };
};
