import { useCallback } from 'react';

export interface Exercise {
    id: string;
    name: string;
    primary_muscles: string[];
    secondary_muscles: string[];
    intensity_factor: number;
    bodyweight_factor: number;
}

export interface WorkoutSet {
    reps: number;
    weight: number;
}

export interface VolumeBreakdown {
    totalVolume: number;
    muscleVolume: Record<string, number>;
}

export const useWorkout = () => {

    /**
     * Calculates the effective volume of a set, accounting for bodyweight and intensity.
     * Also breaks down volume by muscle group (100% for primary, 40% for secondary).
     */
    const calculateEffectiveVolume = useCallback((
        set: WorkoutSet,
        exercise: Exercise,
        userBodyWeight: number
    ): VolumeBreakdown => {

        // Core Formula: (Sets * Reps * (Peso + (PesoUsuario * bodyweight_factor))) * intensity_factor
        // Note: 'Sets' is 1 here as we calculate per set. Caller can sum up.

        const effectiveLoad = set.weight + (userBodyWeight * exercise.bodyweight_factor);
        const rawVolume = 1 * set.reps * effectiveLoad;
        const effectiveSystemicVolume = rawVolume * exercise.intensity_factor;

        const muscleVolume: Record<string, number> = {};

        // Distribute volume to primary muscles (100%)
        exercise.primary_muscles.forEach((muscle) => {
            muscleVolume[muscle] = (muscleVolume[muscle] || 0) + effectiveSystemicVolume;
        });

        // Distribute volume to secondary muscles (40%)
        exercise.secondary_muscles.forEach((muscle) => {
            muscleVolume[muscle] = (muscleVolume[muscle] || 0) + (effectiveSystemicVolume * 0.4);
        });

        return {
            totalVolume: effectiveSystemicVolume,
            muscleVolume
        };
    }, []);

    return {
        calculateEffectiveVolume
    };
};
