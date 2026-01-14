import { useGame } from '../context/GameContext';

export const useWorkout = () => {
    const { workout } = useGame();
    return workout;
};
