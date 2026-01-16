import { useGame } from '../context/GameContext';
import { ThoughtType } from '../types/supabase';

export const useTemple = () => {
    const { temple } = useGame();
    const {
        thoughts,
        sleepRecords,
        loading,
        refresh,
        addThought,
        resolveThought,
        addSleep
    } = temple;

    // Computed
    const positiveThoughts = thoughts.filter(t => t.type === 'POSITIVE');
    const negativeThoughts = thoughts.filter(t => t.type === 'NEGATIVE' && !t.is_resolved);
    const resolvedThoughts = thoughts.filter(t => t.type === 'NEGATIVE' && t.is_resolved);

    const todaySleep = sleepRecords.find(r => r.date === new Date().toISOString().split('T')[0]);

    return {
        positiveThoughts,
        negativeThoughts,
        resolvedThoughts,
        todaySleep,
        loading,
        refresh,
        addGratitude: (content: string) => addThought(content, 'POSITIVE'),
        addWorry: (content: string) => addThought(content, 'NEGATIVE'),
        unleashWorry: (id: string) => resolveThought(id),
        registerSleep: (hours: number, quality?: string) => addSleep(hours, quality)
    };
};
