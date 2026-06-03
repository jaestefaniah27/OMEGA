import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { showGlobalToast } from '../context/ToastContext';

// Sesión única estilo Clash of Clans: al iniciar sesión este dispositivo
// "reclama" la cuenta escribiendo un session_id propio en el perfil. Cuando
// otro dispositivo reclama, este lo detecta (al abrir/enfocar la app) y cierra
// sesión. Sin tiempo real: comprobación en foreground (suficiente).

const SID_KEY = '@omega_session_id';
let localSid: string | null = null;
let currentUserId: string | null = null;
let kicked = false;
let wired = false;

const uuid = (): string =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

// Reclama la cuenta para ESTE dispositivo (último login gana).
const claimSession = async (userId: string) => {
    const sid = uuid();
    localSid = sid;
    currentUserId = userId;
    kicked = false;
    await AsyncStorage.setItem(SID_KEY, sid);
    await supabase
        .from('profiles')
        .update({ active_session_id: sid, active_session_at: new Date().toISOString() })
        .eq('id', userId);
};

// Comprueba si seguimos siendo el dispositivo activo; si no, expulsa.
const checkSession = async () => {
    if (kicked || !currentUserId) return;
    if (!localSid) localSid = await AsyncStorage.getItem(SID_KEY);
    if (!localSid) return;
    const { data, error } = await supabase
        .from('profiles')
        .select('active_session_id')
        .eq('id', currentUserId)
        .single();
    if (error || !data?.active_session_id) return; // offline o aún sin reclamar: no expulsar
    if (data.active_session_id !== localSid) {
        kicked = true;
        showGlobalToast('Tu cuenta se abrió en otro dispositivo', 'info');
        await supabase.auth.signOut();
    }
};

export const wireSessionGuard = (): void => {
    if (wired) return;
    wired = true;

    supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            currentUserId = session.user.id;
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                claimSession(session.user.id);
            }
        } else {
            currentUserId = null;
        }
    });

    AppState.addEventListener('change', (state) => {
        if (state === 'active') checkSession();
    });
};
