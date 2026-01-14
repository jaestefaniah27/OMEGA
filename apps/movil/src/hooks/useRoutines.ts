import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Routine, RoutineExercise, Exercise } from '../types/supabase';

export interface RoutineWithExercises extends Routine {
    exercises: (RoutineExercise & { exercise: Exercise })[];
}

export const useRoutines = () => {
    const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
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

    const createRoutine = async (name: string, description?: string, exercises: { exercise_id: string, order_index: number, target_sets?: number, target_reps?: number }[] = []) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            // 1. Create Routine
            const { data: routine, error: rError } = await supabase
                .from('routines')
                .insert([{ name, description, user_id: user.id }])
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

    useEffect(() => {
        fetchRoutines();
    }, [fetchRoutines]);

    return {
        routines,
        loading,
        refreshRoutines: fetchRoutines,
        createRoutine,
        deleteRoutine
    };
};
