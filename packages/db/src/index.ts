import { createClient } from '@supabase/supabase-js';

/**
 * Utility to get environment variables across different platforms (Expo, Vite, Node)
 */
const getEnv = (key: string): string => {
    const global = globalThis as any;

    // 1. Check process.env (Node / Expo)
    if (global.process?.env?.[key]) {
        return global.process.env[key];
    }

    // 2. Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }

    return "";
};

const supabaseUrl =
    getEnv('EXPO_PUBLIC_SUPABASE_URL') ||
    getEnv('VITE_SUPABASE_URL') ||
    "";

const supabaseAnonKey =
    getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('VITE_SUPABASE_ANON_KEY') ||
    "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
