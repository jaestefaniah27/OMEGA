import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { enqueue } from '../offline/outbox';
import { TavernWater } from '../types/supabase';

// Datos de la Taberna vía React Query. Reemplaza el slice de tavern del
// God Context: añadir agua invalida SOLO ['tavern'].
export const useTavernData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.tavern,
        enabled: !!userId,
        queryFn: async (): Promise<TavernWater[]> => {
            const { data, error } = await supabase
                .from('tavern_water')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
    });

    const records = query.data ?? [];

    const addWater = async (amount: number = 1) => {
        if (!userId) return;
        const today = new Date().toISOString().split('T')[0];
        const existing = records.find(r => r.date === today);

        // Optimistic update sobre la caché.
        queryClient.setQueryData<TavernWater[]>(qk.tavern, (old = []) => {
            const idx = old.findIndex(r => r.date === today);
            if (idx >= 0) {
                const copy = [...old];
                copy[idx] = { ...copy[idx], amount: copy[idx].amount + amount };
                return copy;
            }
            return [
                { id: `temp_${Date.now()}`, user_id: userId, amount, date: today, created_at: new Date().toISOString() } as TavernWater,
                ...old,
            ];
        });

        if (existing) {
            enqueue({ kind: 'update', table: 'tavern_water', values: { amount: existing.amount + amount }, match: { id: existing.id }, invalidate: qk.tavern });
        } else {
            enqueue({ kind: 'insert', table: 'tavern_water', values: { amount, user_id: userId }, invalidate: qk.tavern });
        }
    };

    return {
        waterRecords: records,
        loading: query.isLoading,
        addWater,
        refresh: () => queryClient.invalidateQueries({ queryKey: qk.tavern }),
    };
};
