import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { TheatreActivity, TheatreMovie, TheatreSeries, TheatreSeason } from '../types/supabase';

type SeriesWithSeasons = TheatreSeries & { seasons: TheatreSeason[] };
interface TheatreData {
    activities: TheatreActivity[];
    movies: TheatreMovie[];
    series: SeriesWithSeasons[];
    activityStats: Record<string, { totalMinutes: number; daysCount: number }>;
}

// Datos del Teatro vía React Query. queryFn = los mismos selects que estaban
// en GameContext.fetchAll (incluida la limitación de 10 temporadas/serie).
export const useTheatreData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.theatre,
        enabled: !!userId,
        queryFn: async (): Promise<TheatreData> => {
            const [actRes, movRes, serRes, seasRes] = await Promise.all([
                supabase.from('theatre_activities').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_movies').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_series').select('*').order('created_at', { ascending: false }),
                supabase.from('theatre_seasons').select('*').order('season_number', { ascending: true }),
            ]);
            const seasData = seasRes.data ?? [];
            const series: SeriesWithSeasons[] = (serRes.data ?? []).map((s: any) => ({
                ...s,
                seasons: seasData.filter((sea: any) => sea.series_id === s.id).slice(-10),
            }));
            const activityStats: Record<string, { totalMinutes: number; daysCount: number }> = {};
            (actRes.data ?? []).forEach((act: any) => {
                activityStats[act.id] = { totalMinutes: act.total_minutes || 0, daysCount: act.days_count || 0 };
            });
            return { activities: actRes.data ?? [], movies: movRes.data ?? [], series, activityStats };
        },
    });

    const data = query.data ?? { activities: [], movies: [], series: [], activityStats: {} };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.theatre });

    const addActivity = async (name: string) => {
        if (!userId) return;
        const { data: row } = await supabase.from('theatre_activities').insert([{ name, user_id: userId }]).select().single();
        invalidate();
        return row;
    };
    const updateActivity = async (id: string, name: string) => {
        await supabase.from('theatre_activities').update({ name }).eq('id', id);
        invalidate();
    };
    const addMovie = async (title: string, director?: string, saga?: string, comment?: string, rating: number = 0) => {
        if (!userId) return;
        const { data: row } = await supabase.from('theatre_movies').insert([{ title, director, saga, comment, rating, user_id: userId }]).select().single();
        invalidate();
        return row;
    };
    const updateMovie = async (id: string, updates: Partial<TheatreMovie>) => {
        await supabase.from('theatre_movies').update(updates).eq('id', id);
        invalidate();
    };
    const addSeries = async (title: string) => {
        if (!userId) return;
        const { data: row } = await supabase.from('theatre_series').insert([{ title, user_id: userId }]).select().single();
        invalidate();
        return row;
    };
    const updateSeries = async (id: string, title: string) => {
        await supabase.from('theatre_series').update({ title }).eq('id', id);
        invalidate();
    };
    const addSeason = async (series_id: string, season_number: number, episodes_count?: number, comment?: string, rating: number = 0) => {
        await supabase.from('theatre_seasons').insert([{ series_id, season_number, episodes_count, comment, rating }]);
        invalidate();
    };
    const updateSeason = async (id: string, updates: Partial<TheatreSeason>) => {
        await supabase.from('theatre_seasons').update(updates).eq('id', id);
        invalidate();
    };

    return {
        activities: data.activities,
        movies: data.movies,
        series: data.series,
        activityStats: data.activityStats,
        loading: query.isLoading,
        refresh: invalidate,
        addActivity, updateActivity, addMovie, updateMovie,
        addSeries, updateSeries, addSeason, updateSeason,
    };
};
