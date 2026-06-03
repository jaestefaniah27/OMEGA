import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { RoutineWithExercises, MuscleFatigue, PersonalRecord } from '../types/supabase';

interface WorkoutHistoryItem {
    id: string;
    date: string;
    routine: string;
    duration: string;
    tonnage: string;
}

interface BarracksData {
    routines: RoutineWithExercises[];
    history: WorkoutHistoryItem[];
    muscleFatigue: MuscleFatigue;
    records: PersonalRecord[];
}

// Datos de los Barracones vía React Query. queryFn = selects/RPCs de fetchAll.
export const useBarracksData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.barracks,
        enabled: !!userId,
        queryFn: async (): Promise<BarracksData> => {
            const [routinesRes, historyRes, fatigueRes, recordsRes] = await Promise.all([
                supabase.from('routines').select(`*, exercises:routine_exercises(*, exercise:exercises(*))`).eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('workout_sessions').select(`*, routine:routines(name), sets:workout_sets(weight_kg, reps)`).eq('user_id', userId).order('started_at', { ascending: false }).limit(5),
                supabase.rpc('get_muscle_heat_map', { user_uuid: userId }),
                supabase.rpc('get_personal_records', { user_uuid: userId }),
            ]);

            const history: WorkoutHistoryItem[] = (historyRes.data ?? []).map((session: any) => {
                const totalTonnage = (session.sets ?? []).reduce((acc: number, set: any) => acc + (set.weight_kg * set.reps), 0);
                const duration = session.ended_at
                    ? Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000) + 'm'
                    : 'En curso';
                return {
                    id: session.id,
                    date: new Date(session.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    routine: session.routine?.name || 'Misión Libre',
                    duration,
                    tonnage: totalTonnage.toLocaleString() + 'kg',
                };
            });

            return {
                routines: routinesRes.data ?? [],
                history,
                muscleFatigue: fatigueRes.data ?? {},
                records: recordsRes.data ?? [],
            };
        },
    });

    const data = query.data ?? { routines: [], history: [], muscleFatigue: {}, records: [] };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.barracks });

    const createRoutine = async (name: string, category?: string) => {
        if (!userId) return;
        const { data: routine } = await supabase.from('routines').insert([{ name, category, user_id: userId }]).select().single();
        invalidate();
        return routine;
    };
    const deleteRoutine = async (id: string) => {
        await supabase.from('routines').delete().eq('id', id);
        invalidate();
    };
    const addExerciseToRoutine = async (routineId: string, exerciseId: string, orderIndex: number) => {
        await supabase.from('routine_exercises').insert([{ routine_id: routineId, exercise_id: exerciseId, order_index: orderIndex, target_sets: 3, target_reps: 10 }]);
        invalidate();
    };
    const removeExerciseFromRoutine = async (routineExerciseId: string) => {
        await supabase.from('routine_exercises').delete().eq('id', routineExerciseId);
        invalidate();
    };
    const updateRoutineExercise = async (id: string, updates: { target_sets?: number; target_reps?: number }) => {
        await supabase.from('routine_exercises').update(updates).eq('id', id);
        invalidate();
    };

    return {
        routines: data.routines,
        history: data.history,
        muscleFatigue: data.muscleFatigue,
        records: data.records,
        loading: query.isLoading,
        refresh: invalidate,
        createRoutine, deleteRoutine, addExerciseToRoutine, removeExerciseFromRoutine, updateRoutineExercise,
    };
};
