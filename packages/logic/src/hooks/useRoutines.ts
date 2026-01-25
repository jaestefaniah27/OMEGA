import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { Routine, RoutineExercise, WorkoutSession } from '../database/models';

export const useRoutines = () => {
    const { user, database: db, sync } = useGame();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [history, setHistory] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const routineSub = db.get<Routine>('routines')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(records => {
                setRoutines(records);
                setLoading(false);
            });

        const historySub = db.get<WorkoutSession>('workout_sessions')
            .query(Q.where('user_id', user.id), Q.sortBy('started_at', Q.desc))
            .observe()
            .subscribe(setHistory);

        return () => {
            routineSub.unsubscribe();
            historySub.unsubscribe();
        };
    }, [user]);

    const createRoutine = async (name: string, category?: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<Routine>('routines').create(r => {
                r.user_id = user.id;
                r.name = name;
                r.category = category;
            });
        });
    };

    const deleteRoutine = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<Routine>('routines').find(id);
            await record.markAsDeleted();
        });
    };

    const addExerciseToRoutine = async (routineId: string, exerciseId: string, orderIndex: number) => {
        await db.write(async () => {
            await db.get<RoutineExercise>('routine_exercises').create(re => {
                re.routine_id = routineId;
                re.exercise_id = exerciseId;
                re.order_index = orderIndex;
                re.target_sets = 3;
                re.target_reps = 10;
            });
        });
    };

    const refreshHistory = async () => {
        await sync();
    };

    const removeExerciseFromRoutine = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<RoutineExercise>('routine_exercises').find(id);
            await record.markAsDeleted();
        });
    };

    const updateRoutineExercise = async (id: string, updates: any) => {
        await db.write(async () => {
            const record = await db.get<RoutineExercise>('routine_exercises').find(id);
            await record.update(re => {
                Object.assign(re, updates);
            });
        });
    };

    return {
        routines,
        history,
        loading,
        createRoutine,
        deleteRoutine,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        updateRoutineExercise,
        refreshHistory,
        refresh: sync
    };
};
