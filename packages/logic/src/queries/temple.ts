import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { awardXp } from './rewards';
import { showGlobalToast } from '../context/ToastContext';
import { TempleThought, TempleSleep, ThoughtType } from '../types/supabase';

interface TempleData {
    thoughts: TempleThought[];
    sleepRecords: TempleSleep[];
}

// Datos del Templo (pensamientos + sueño) vía React Query.
export const useTempleData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.temple,
        enabled: !!userId,
        queryFn: async (): Promise<TempleData> => {
            const [thoughtsRes, sleepRes] = await Promise.all([
                supabase.from('temple_thoughts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
                supabase.from('temple_sleep').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
            ]);
            if (thoughtsRes.error) throw thoughtsRes.error;
            return {
                thoughts: thoughtsRes.data ?? [],
                sleepRecords: sleepRes.data ?? [],
            };
        },
    });

    const data = query.data ?? { thoughts: [], sleepRecords: [] };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.temple });

    const addThought = async (content: string, type: ThoughtType) => {
        if (!userId) return;
        const optimistic: TempleThought = {
            id: `temp_${Date.now()}`, user_id: userId, content, type, is_resolved: false,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<TempleData>(qk.temple, (old = { thoughts: [], sleepRecords: [] }) => ({
            ...old, thoughts: [optimistic, ...old.thoughts],
        }));
        await supabase.from('temple_thoughts').insert([{ content, type, user_id: userId }]);
        invalidate();
    };

    const resolveThought = async (id: string) => {
        queryClient.setQueryData<TempleData>(qk.temple, (old = { thoughts: [], sleepRecords: [] }) => ({
            ...old, thoughts: old.thoughts.map(t => t.id === id ? { ...t, is_resolved: true } : t),
        }));
        await supabase.from('temple_thoughts').update({ is_resolved: true }).eq('id', id);
        showGlobalToast('✨ Pensamiento Liberado', 'success');
        await awardXp(10);
        invalidate();
    };

    const addSleep = async (hours: number, quality?: string) => {
        if (!userId) return;
        const optimistic: TempleSleep = {
            id: `temp_${Date.now()}`, user_id: userId, hours, quality: quality ?? null,
            date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<TempleData>(qk.temple, (old = { thoughts: [], sleepRecords: [] }) => ({
            ...old, sleepRecords: [optimistic, ...old.sleepRecords],
        }));
        await supabase.from('temple_sleep').insert([{ hours, quality, user_id: userId }]);
        await awardXp(20);
        invalidate();
    };

    return {
        thoughts: data.thoughts,
        sleepRecords: data.sleepRecords,
        loading: query.isLoading,
        refresh: invalidate,
        addThought,
        resolveThought,
        addSleep,
    };
};
