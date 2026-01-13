import { useGame } from '../context/GameContext';

export const useUserStats = () => {
    const { profile, user } = useGame();

    // If context is hydrating (initial load), we might want to show loading.
    // However, since we have offline persistence, gameLoading will be false almost immediately.
    // If we don't have a user yet, we might return loading true or null profile.

    return {
        profile,
        loading: (!profile && !!user), // If we have a user but no profile, we are likely fetching
        error: null
    };
};
