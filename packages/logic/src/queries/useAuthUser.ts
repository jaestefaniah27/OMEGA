import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Usuario autenticado como query cacheada. Fuente de userId para los
// hooks de dominio sin acoplarlos al God Context.
// GameContext invalida ['authUser'] en los eventos de auth (Fase 5).
export const useAuthUser = () =>
    useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            return data.user;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
