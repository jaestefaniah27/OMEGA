import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
    // 1. Check process.env (Node / Expo)
    try {
        if (typeof process !== 'undefined' && process.env?.[key]) {
            return process.env[key] as string;
        }
    } catch (e) { }

    // 2. Check global.process.env
    // @ts-ignore
    const globalAny = globalThis;
    try {
        if (globalAny.process?.env?.[key]) {
            return globalAny.process.env[key];
        }
    } catch (e) { }

    // 3. Check import.meta.env (Vite)
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) { }

    return "";
};

const supabaseUrl = getEnv('EXPO_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
