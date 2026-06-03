import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onlineManager } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryClient } from '../queries/queryClient';

// Cola de escrituras offline. Cada acción del usuario se aplica YA en la
// caché (optimistic) y se encola aquí; cuando hay red, se reenvía al server.
// Sobrevive a cierres de app (persistida en AsyncStorage). last-write-wins.

export type OutboxOpInput =
    | { kind: 'insert'; table: string; values: any; invalidate?: readonly unknown[] }
    | { kind: 'update'; table: string; values: any; match: Record<string, any>; invalidate?: readonly unknown[] }
    | { kind: 'delete'; table: string; match: Record<string, any>; invalidate?: readonly unknown[] }
    | { kind: 'rpc'; fn: string; args: any; invalidate?: readonly unknown[] };

export type OutboxOp = OutboxOpInput & { id: string };

const KEY = '@omega_outbox_v1';
let queue: OutboxOp[] = [];
let loaded = false;
let flushing = false;
const listeners = new Set<() => void>();

const persist = () => { AsyncStorage.setItem(KEY, JSON.stringify(queue)).catch(() => {}); };
const notify = () => listeners.forEach((l) => l());
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const pendingCount = (): number => queue.length;
export const subscribeOutbox = (l: () => void): (() => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
};

// Hook reactivo: nº de cambios pendientes de sincronizar (para UI).
export const usePendingSyncCount = (): number =>
    useSyncExternalStore(subscribeOutbox, pendingCount, pendingCount);

// Inicializa la cola desde disco y arranca el flush al recuperar red.
export const initOutbox = async (): Promise<void> => {
    if (loaded) return;
    try {
        const json = await AsyncStorage.getItem(KEY);
        if (json) queue = JSON.parse(json);
    } catch { /* noop */ }
    loaded = true;
    notify();
    onlineManager.subscribe(() => { if (onlineManager.isOnline()) flush(); });
    if (onlineManager.isOnline()) flush();
};

export const enqueue = (op: OutboxOpInput): void => {
    queue.push({ ...op, id: uid() } as OutboxOp);
    persist();
    notify();
    if (onlineManager.isOnline()) flush();
};

const exec = async (op: OutboxOp) => {
    if (op.kind === 'insert') return supabase.from(op.table).insert(op.values);
    if (op.kind === 'update') {
        let q = supabase.from(op.table).update(op.values) as any;
        for (const k in op.match) q = q.eq(k, op.match[k]);
        return q;
    }
    if (op.kind === 'delete') {
        let q = supabase.from(op.table).delete() as any;
        for (const k in op.match) q = q.eq(k, op.match[k]);
        return q;
    }
    return supabase.rpc(op.fn, op.args);
};

// Procesa la cola en orden. Si una op falla por red -> se conserva y se
// reintenta luego. Si la rechaza el server (error lógico) -> se descarta
// para no bloquear la cola (poison message).
export const flush = async (): Promise<void> => {
    if (flushing || !onlineManager.isOnline() || queue.length === 0) return;
    flushing = true;
    const toInvalidate = new Set<string>();
    try {
        while (queue.length > 0 && onlineManager.isOnline()) {
            const op = queue[0];
            let networkFail = false;
            try {
                const res: any = await exec(op);
                if (res?.error) {
                    console.warn('[outbox] op rechazada por el server, se descarta:', op.kind, op, res.error?.message);
                }
            } catch (e) {
                // Excepción = fallo de red -> conservar y reintentar más tarde.
                networkFail = true;
            }
            if (networkFail) break;
            if (op.invalidate) toInvalidate.add(JSON.stringify(op.invalidate));
            queue.shift();
            persist();
            notify();
        }
    } finally {
        flushing = false;
        toInvalidate.forEach((s) => queryClient.invalidateQueries({ queryKey: JSON.parse(s) }));
    }
};
