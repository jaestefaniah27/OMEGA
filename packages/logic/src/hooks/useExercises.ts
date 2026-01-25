import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { Exercise } from '../database/models';

export const useExercises = (searchQuery: string = '', onlyPopular: boolean = false, onlyFavorites: boolean = false) => {
    const { database: db } = useGame();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let query = db.get<Exercise>('exercises').query();

        const conditions = [];
        if (onlyFavorites) {
            conditions.push(Q.where('is_favorite', true));
        }
        if (onlyPopular && !onlyFavorites) {
            conditions.push(Q.where('is_popular', true));
        }
        if (searchQuery) {
            conditions.push(Q.or(
                Q.where('name', Q.like(`%${searchQuery}%`)),
                Q.where('name_es', Q.like(`%${searchQuery}%`))
            ));
        }

        if (conditions.length > 0) {
            query = query.extend(...conditions);
        }

        const sub = query.observe().subscribe(records => {
            setExercises(records);
            setLoading(false);
        });

        return () => sub.unsubscribe();
    }, [searchQuery, onlyPopular, onlyFavorites]);

    const toggleFavorite = async (exerciseId: string) => {
        await db.write(async () => {
            const exercise = await db.get<Exercise>('exercises').find(exerciseId);
            await exercise.update(ex => {
                ex.is_favorite = !ex.is_favorite;
            });
        });
    };

    return {
        exercises,
        toggleFavorite,
        loading,
        favorites: exercises.filter(e => e.is_favorite).map(e => e.id)
    };
};
