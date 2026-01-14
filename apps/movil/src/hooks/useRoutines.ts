import { useGame } from '../context/GameContext';
import { Routine, RoutineExercise, Exercise } from '../types/supabase';

export interface RoutineWithExercises extends Routine {
    exercises: (RoutineExercise & { exercise: Exercise })[];
}

export const useRoutines = () => {
    const { barracks } = useGame();
    const {
        routines,
        history,
        loading,
        refresh,
        createRoutine: ctxCreateRoutine,
        deleteRoutine: ctxDeleteRoutine,
        addExerciseToRoutine: ctxAddExerciseToRoutine,
        removeExerciseFromRoutine: ctxRemoveExerciseFromRoutine,
        updateRoutineExercise: ctxUpdateRoutineExercise
    } = barracks;

    const createRoutine = (name: string, category?: string) => ctxCreateRoutine(name, category);
    const deleteRoutine = (id: string) => ctxDeleteRoutine(id);
    const addExerciseToRoutine = (routineId: string, exerciseId: string, orderIndex: number) => 
        ctxAddExerciseToRoutine(routineId, exerciseId, orderIndex);
    const removeExerciseFromRoutine = (routineExerciseId: string) => 
        ctxRemoveExerciseFromRoutine(routineExerciseId);
    const updateRoutineExercise = (id: string, updates: { target_sets?: number, target_reps?: number }) => 
        ctxUpdateRoutineExercise(id, updates);

    return {
        routines,
        history,
        loading,
        refreshRoutines: refresh,
        refreshHistory: refresh,
        createRoutine,
        deleteRoutine,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        updateRoutineExercise
    };
};
