import { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export const useTavern = () => {
    const { tavern, profile } = useGame();

    const today = new Date().toISOString().split('T')[0];

    const todayWater = useMemo(() => {
        const record = tavern.waterRecords.find(r => r.date === today);
        return record ? record.amount : 0;
    }, [tavern.waterRecords, today]);

    // Recommended water: Expert recommendation
    // Standard: 8 glasses (aprox 2L). For a gameified experience, we'll stick with 8.
    const recommendedWater = 8;
    const isGoalReached = todayWater >= recommendedWater;

    const registerWater = async (amount: number = 1) => {
        return await tavern.addWater(amount);
    };

    return {
        todayWater,
        recommendedWater,
        isGoalReached,
        registerWater,
        loading: tavern.loading,
        refresh: tavern.refresh
    };
};
