import { supabase } from '../lib/supabase';
import { queryClient } from './queryClient';
import { qk } from './keys';

// Helpers de recompensa reutilizables por las mutaciones de cada dominio.
// Llaman a la RPC y refrescan el alma del héroe (user_stats) + perfil.
// Sustituyen a las llamadas addXp/addGold acopladas al God Context.
export const awardXp = async (amount: number) => {
    if (amount <= 0) return;
    const { error } = await supabase.rpc('add_xp', { amount });
    if (error) console.error('awardXp: add_xp falló', error);
    queryClient.invalidateQueries({ queryKey: qk.heroStats });
    queryClient.invalidateQueries({ queryKey: qk.profile });
};

export const awardGold = async (amount: number) => {
    if (amount <= 0) return;
    const { error } = await supabase.rpc('add_gold', { amount });
    if (error) console.error('awardGold: add_gold falló', error);
    queryClient.invalidateQueries({ queryKey: qk.heroStats });
    queryClient.invalidateQueries({ queryKey: qk.profile });
};
