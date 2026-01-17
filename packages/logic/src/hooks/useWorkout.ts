import { useGame } from '../context/GameContext';

export const useWorkout = () => {
    const { workout, habits } = useGame();
    return { ...workout, habits };
};
