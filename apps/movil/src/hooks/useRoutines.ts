import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Routine, RoutineExercise, Exercise } from '../types/supabase';

export interface RoutineWithExercises extends Routine {
    exercises: (RoutineExercise & { exercise: Exercise })[];
}

export const useRoutines = () => {
    const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRoutines = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('routines')
                .select(`
                    *,
                    exercises:routine_exercises(
                        *,
                        exercise:exercises(*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoutines(data || []);
        } catch (e) {
            console.error('Error fetching routines:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('workout_sessions')
                .select(`
                    *,
                    routine:routines(name),
                    sets:workout_sets(weight_kg, reps)
                `)
                .eq('user_id', user.id)
                .order('started_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const formattedHistory = (data || []).map(session => {
                const totalTonnage = session.sets.reduce((acc: number, set: any) => acc + (set.weight_kg * set.reps), 0);
                const duration = session.ended_at 
                    ? Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000) + 'm'
                    : 'En curso';
                
                return {
                    id: session.id,
                    date: new Date(session.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    routine: session.routine?.name || 'Misión Libre',
                    duration,
                    tonnage: totalTonnage.toLocaleString() + 'kg'
                };
            });

            setHistory(formattedHistory);
        } catch (e) {
            console.error('Error fetching history:', e);
        }
    }, []);

    const createRoutine = async (name: string, category?: string, description?: string, exercises: { exercise_id: string, order_index: number, target_sets?: number, target_reps?: number }[] = []) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            // 1. Create Routine
            const { data: routine, error: rError } = await supabase
                .from('routines')
                .insert([{ name, category, description, user_id: user.id }])
                .select()
                .single();

            if (rError) throw rError;

            // 2. Add Exercises if any
            if (exercises.length > 0) {
                const exercisesToInsert = exercises.map(ex => ({
                    routine_id: routine.id,
                    ...ex
                }));
                const { error: exError } = await supabase
                    .from('routine_exercises')
                    .insert(exercisesToInsert);
                
                if (exError) throw exError;
            }

            await fetchRoutines();
            return routine;
        } catch (e) {
            console.error('Error creating routine:', e);
            throw e;
        }
    };

    const deleteRoutine = async (id: string) => {
        try {
            const { error } = await supabase.from('routines').delete().eq('id', id);
            if (error) throw error;
            setRoutines(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error('Error deleting routine:', e);
            throw e;
        }
    };

    const addExerciseToRoutine = async (routineId: string, exerciseId: string, orderIndex: number) => {
        try {
            const { error } = await supabase
                .from('routine_exercises')
                .insert([{
                    routine_id: routineId,
                    exercise_id: exerciseId,
                    order_index: orderIndex,
                    target_sets: 3,
                    target_reps: 10
                }]);
            if (error) throw error;
            await fetchRoutines();
        } catch (e) {
            console.error('Error adding exercise to routine:', e);
            throw e;
        }
    };

    const removeExerciseFromRoutine = async (routineExerciseId: string) => {
        try {
            const { error } = await supabase
                .from('routine_exercises')
                .delete()
                .eq('id', routineExerciseId);
            if (error) throw error;
            await fetchRoutines();
        } catch (e) {
            console.error('Error removing exercise from routine:', e);
            throw e;
        }
    };

    const updateRoutineExercise = async (id: string, updates: { target_sets?: number, target_reps?: number }) => {
        try {
            const { error } = await supabase
                .from('routine_exercises')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            await fetchRoutines();
        } catch (e) {
            console.error('Error updating routine exercise:', e);
            throw e;
        }
    };

    useEffect(() => {
        fetchRoutines();
        fetchHistory();
    }, [fetchRoutines, fetchHistory]);

    return {
        routines,
        history,
        loading,
        refreshRoutines: fetchRoutines,
        refreshHistory: fetchHistory,
        createRoutine,
        deleteRoutine,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        updateRoutineExercise
    };
};
