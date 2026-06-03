import { AppState, Platform } from 'react-native';
import { QueryClient, focusManager } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// QueryClient único de la app. Sustituye al estado del God Context.
// staleTime alto + dedup de React Query elimina la tormenta de fetchAll.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,        // 60s: evita refetch en cascada
            gcTime: 5 * 60 * 1000,       // 5min en caché tras quedar sin uso
            retry: false,                // móvil: no reintentar en bucle
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,  // gestionado por focusManager (AppState)
        },
    },
});

// Persistencia acotada en AsyncStorage (reemplaza el God-dump de saveToLocal).
// El persister trocea/throttlea en background; maxAge limita el crecimiento.
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: '@omega_rq_cache_v1',
    throttleTime: 1000,
});

export const persistOptions = {
    persister: asyncStoragePersister,
    maxAge: 24 * 60 * 60 * 1000, // 24h
};

// Conecta el "focus" de React Query al ciclo de vida de la app (AppState),
// para refetch al volver a primer plano sin un poll manual.
let appStateSub: { remove: () => void } | null = null;
export const wireFocusManager = () => {
    if (appStateSub) return;
    focusManager.setEventListener((handleFocus) => {
        const sub = AppState.addEventListener('change', (state) => {
            if (Platform.OS !== 'web') {
                handleFocus(state === 'active');
            }
        });
        appStateSub = sub;
        return () => {
            sub.remove();
            appStateSub = null;
        };
    });
};
