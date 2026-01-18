import { DiagnosticStore } from './DiagnosticStore';
import { supabase } from '../lib/supabase';

export const initInterceptors = () => {
    // 1. Timer Interceptor (React Native / Web)
    const globalAny = global as any;

    const originalSetInterval = globalAny.setInterval;
    const originalClearInterval = globalAny.clearInterval;

    if (originalSetInterval && !originalSetInterval.__wrapped) {
        globalAny.setInterval = function (...args: any[]) {
            DiagnosticStore.incrementIntervals();
            return originalSetInterval.apply(this, args);
        };
        globalAny.setInterval.__wrapped = true;
    }

    if (originalClearInterval && !originalClearInterval.__wrapped) {
        globalAny.clearInterval = function (id: any) {
            if (id) DiagnosticStore.decrementIntervals();
            return originalClearInterval.apply(this, [id]);
        };
        globalAny.clearInterval.__wrapped = true;
    }

    // 2. Supabase Interceptor
    // We wrap the channel method on the singleton instance
    const originalChannel = supabase.channel.bind(supabase);

    supabase.channel = (name: string, opts?: any) => {
        const channel = originalChannel(name, opts);

        const originalSubscribe = channel.subscribe.bind(channel);
        const originalUnsubscribe = channel.unsubscribe.bind(channel);

        let isSubscribed = false;

        channel.subscribe = (callback?: any) => {
            if (!isSubscribed) {
                DiagnosticStore.incrementChannels();
                isSubscribed = true;
            }
            return originalSubscribe(callback);
        };

        channel.unsubscribe = () => {
            if (isSubscribed) {
                DiagnosticStore.decrementChannels();
                isSubscribed = false;
            }
            return originalUnsubscribe();
        };

        return channel;
    };

    console.log('✅ [Microscopio] Interceptors initialized (Timers + Supabase)');
};
