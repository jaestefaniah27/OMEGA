import { useGame } from '../context/GameContext';
import { useBarracksData } from '../queries/barracks';

export const useUserStats = () => {
    const { profile, user, heroStats } = useGame();
    const {
        muscleFatigue,
        records,
        loading: barracksLoading,
        refresh
    } = useBarracksData();

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
