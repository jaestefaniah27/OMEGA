import { useGame } from '../context/GameContext';

export const useUserStats = () => {
    const { profile, user, barracks } = useGame();
    const { 
        muscleFatigue, 
        records, 
        loading: barracksLoading,
        refresh 
    } = barracks;

    return {
        profile,
        muscleFatigue,
        records,
        loading: (!profile && !!user) || barracksLoading,
        refreshStats: refresh,
        error: null
    };
};
