import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useWorker = () => {
    const [loading, setLoading] = useState(false);
    const [openApps, setOpenApps] = useState<{ name: string, pid: number }[]>([]);

    const getDetectedApps = async (): Promise<{ name: string, pid?: number }[]> => {
        setLoading(true);
        setOpenApps([]); // Clear previous
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { data, error } = await supabase
                .from('detected_apps')
                .select('process_name, last_seen')
                .eq('user_id', user.id)
                .order('last_seen', { ascending: false })
                .limit(50);

            if (error) throw error;

            const apps = (data || []).map(d => ({ name: d.process_name, pid: 0 }));
            setOpenApps(apps);
            setLoading(false);
            return apps;
        } catch (e) {
            console.error(e);
            setLoading(false);
            throw e;
        }
    };

    const linkAppToTheme = async (processName: string, themeId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { error } = await supabase
            .from('app_aura_mappings')
            .upsert({
                user_id: user.id,
                process_name: processName,
                theme_id: themeId
            });

        if (error) throw error;
    };

    return { getDetectedApps, openApps, loading, linkAppToTheme };
};
