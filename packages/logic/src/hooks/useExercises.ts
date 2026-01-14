import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import coreExercises from '../data/core_exercises.json';
import { Exercise } from '../types/supabase';

export const useExercises = (searchQuery: string = '', onlyPopular: boolean = false, onlyFavorites: boolean = false) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch user favorites
    const fetchFavorites = useCallback(async (uid: string) => {
        try {
            const { data, error: favError } = await supabase
                .from('user_exercise_favorites')
                .select('exercise_id')
                .eq('user_id', uid);

            if (!favError && data) {
                setFavorites(data.map(f => f.exercise_id));
            } else if (favError) {
                console.error('❌ Error fetching favorites:', favError);
            }
        } catch (err) {
            console.error('❌ Error in fetchFavorites:', err);
        }
    }, []);

    // Auth listener to handle session restoration from AsyncStorage
    useEffect(() => {
        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
                fetchFavorites(session.user.id);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                fetchFavorites(session.user.id);
            } else {
                setUserId(null);
                setFavorites([]);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchFavorites]);

    const toggleFavorite = async (exerciseId: string) => {
        try {
            // Validate UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(exerciseId)) {
                console.warn('⚠️ Cannot favorite item without valid UUID:', exerciseId);
                return;
            }

            if (!userId) {
                console.warn('⚠️ Must be logged in to favorite exercises. Current userId:', userId);
                // Try to get session one last time
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                setUserId(session.user.id);
            }

            const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
            if (!currentUserId) return;

            if (favorites.includes(exerciseId)) {
                const { error: delError } = await supabase
                    .from('user_exercise_favorites')
                    .delete()
                    .eq('user_id', currentUserId)
                    .eq('exercise_id', exerciseId);

                if (!delError) {
                    setFavorites(prev => prev.filter(id => id !== exerciseId));
                } else {
                    console.error('❌ Error removing favorite:', delError);
                }
            } else {
                const { error: insError } = await supabase
                    .from('user_exercise_favorites')
                    .insert([{ user_id: currentUserId, exercise_id: exerciseId }]);

                if (!insError) {
                    setFavorites(prev => [...prev, exerciseId]);
                } else {
                    console.error('❌ Error adding favorite:', insError);
                }
            }
        } catch (err) {
            console.error('❌ Error in toggleFavorite:', err);
        }
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setLoading(true);

                // If only favorites, and we have no favorites list yet, wait or return empty
                if (onlyFavorites && favorites.length === 0) {
                    setExercises([]);
                    setLoading(false);
                    return;
                }

                // Base query
                let queryBuilder = supabase
                    .from('exercises')
                    .select('*');

                if (onlyFavorites) {
                    queryBuilder = queryBuilder.in('id', favorites);
                }

                if (searchQuery) {
                    queryBuilder = queryBuilder.or(`name.ilike.%${searchQuery}%,name_es.ilike.%${searchQuery}%`);
                }

                if (onlyPopular && !onlyFavorites) {
                    queryBuilder = queryBuilder.eq('is_popular', true);
                }

                const { data, error: supabaseError } = await queryBuilder
                    .order('name_es', { ascending: true })
                    .limit(searchQuery ? 50 : 30);

                if (supabaseError) throw supabaseError;

                let results = (data || []) as Exercise[];

                // Merge with local data for popular if DB results are few/empty
                if (onlyPopular && !searchQuery && !onlyFavorites) {
                    const localCore = coreExercises as any as Exercise[];
                    const uniqueNames = new Set(results.map(r => r.name));
                    const merged = [...results];

                    localCore.forEach(localEx => {
                        if (!uniqueNames.has(localEx.name)) {
                            merged.push({
                                ...localEx,
                                is_popular: true
                            });
                        }
                    });
                    results = merged;
                }

                setExercises(results);
            } catch (err: any) {
                console.error('Error fetching exercises:', err);
                setError(err.message);
                if (onlyPopular && !onlyFavorites) {
                    setExercises(coreExercises as any as Exercise[]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [searchQuery, onlyPopular, onlyFavorites, favorites.length]);

    return {
        exercises,
        favorites,
        toggleFavorite,
        loading,
        error,
        isAuthenticated: !!userId
    };
};
