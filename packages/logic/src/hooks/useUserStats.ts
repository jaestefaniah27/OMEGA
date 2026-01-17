import { useGame } from '../context/GameContext';

export const useUserStats = () => {
    const { profile, user, barracks, heroStats } = useGame();
    const {
        muscleFatigue,
        records,
        loading: barracksLoading,
        refresh
    } = barracks;

    return {
        profile,
        heroStats,
        muscleFatigue,
        records,
        loading: (!profile && !!user) || barracksLoading,
        refreshStats: refresh,
        error: null
    };
};
