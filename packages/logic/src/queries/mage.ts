import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { showGlobalToast } from '../context/ToastContext';
import { MageProject, MageTheme, MageAppMapping } from '../types/supabase';

interface MageData {
    projects: MageProject[];
    themes: MageTheme[];
    mappings: MageAppMapping[];
    unhandledAuraByTheme: Record<string, number>;
}

// Datos de la Torre del Mago vía React Query.
export const useMageData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.mage,
        enabled: !!userId,
        queryFn: async (): Promise<MageData> => {
            const [projRes, themeRes, mapRes] = await Promise.all([
                supabase.from('mage_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('mage_themes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('app_aura_mappings').select('*').eq('user_id', userId),
            ]);
            const themes = themeRes.data ?? [];
            const unhandledAuraByTheme: Record<string, number> = {};
            themes.forEach((t: any) => { if (t.pending_aura > 0) unhandledAuraByTheme[t.id] = t.pending_aura; });
            return { projects: projRes.data ?? [], themes, mappings: mapRes.data ?? [], unhandledAuraByTheme };
        },
    });

    const data = query.data ?? { projects: [], themes: [], mappings: [], unhandledAuraByTheme: {} };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.mage });

    const addProject = async (name: string, themeId: string) => {
        if (!userId) return;
        const { data: row, error } = await supabase.from('mage_projects').insert([{ name, theme_id: themeId, user_id: userId }]).select().single();
        if (error) { console.error('MageTower: Error creating project', error); showGlobalToast('Error al crear investigación', 'error'); }
        else invalidate();
        return row;
    };
    const updateProject = async (id: string, updates: Partial<MageProject>) => {
        await supabase.from('mage_projects').update(updates).eq('id', id);
        invalidate();
    };
    const deleteProject = async (id: string) => {
        const { error } = await supabase.from('mage_projects').delete().eq('id', id);
        if (error) console.error('MageTower: Error deleting project', error);
        invalidate();
    };
    const addTheme = async (name: string, symbol: string, color: string) => {
        if (!userId) return;
        const { data: row, error } = await supabase.from('mage_themes').insert([{ name, symbol, color, user_id: userId }]).select().single();
        if (error) { console.error('MageTower: Error creating theme', error); showGlobalToast('Error al crear ámbito', 'error'); }
        else invalidate();
        return row;
    };
    const deleteTheme = async (id: string) => {
        await supabase.from('mage_themes').delete().eq('id', id);
        invalidate();
    };
    const deleteMapping = async (id: string) => {
        try {
            const { error } = await supabase.from('app_aura_mappings').delete().eq('id', id);
            if (error) throw error;
            invalidate();
            showGlobalToast('Canalización eliminada', 'success');
        } catch (e) {
            console.error(e);
            showGlobalToast('Error al eliminar canalización', 'error');
        }
    };

    const canalizeAura = async (projectId: string, themeId: string) => {
        if (!userId) return;
        const aura = data.unhandledAuraByTheme[themeId] || 0;
        if (aura <= 0) return;
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return;

        const { error: pError } = await supabase.from('mage_projects').update({ mana_amount: project.mana_amount + aura }).eq('id', projectId);
        if (pError) throw pError;
        const { error: themeError } = await supabase.from('mage_themes').update({ pending_aura: 0 }).eq('id', themeId);
        if (themeError) throw themeError;

        invalidate();
        showGlobalToast(`¡${aura} de Aura canalizada con éxito!`, 'success');
    };

    const toggleChanneling = async (projectId: string, themeId: string) => {
        if (!userId) return;
        const theme = data.themes.find(t => t.id === themeId);
        if (!theme) return;

        const isCurrentlyActive = theme.active_project_id === projectId;
        const newActiveId = isCurrentlyActive ? null : projectId;

        const { error } = await supabase.from('mage_themes').update({ active_project_id: newActiveId }).eq('id', themeId);
        if (error) { showGlobalToast('Error al cambiar canalización', 'error'); return; }

        if (newActiveId) {
            const aura = data.unhandledAuraByTheme[themeId] || 0;
            if (aura > 0) {
                const project = data.projects.find(p => p.id === newActiveId);
                if (project) {
                    await supabase.from('mage_projects').update({ mana_amount: project.mana_amount + aura }).eq('id', newActiveId);
                    await supabase.from('mage_themes').update({ pending_aura: 0 }).eq('id', themeId);
                    showGlobalToast(`Conexión establecida. +${aura} Aura transferida.`, 'success');
                } else {
                    showGlobalToast('Conexión establecida', 'success');
                }
            } else {
                showGlobalToast('Conexión establecida', 'success');
            }
        } else {
            showGlobalToast('Canalización detenida', 'info');
        }
        invalidate();
    };

    return {
        projects: data.projects,
        themes: data.themes,
        mappings: data.mappings,
        unhandledAuraByTheme: data.unhandledAuraByTheme,
        loading: query.isLoading,
        refresh: invalidate,
        addProject, updateProject, deleteProject, addTheme, deleteTheme,
        deleteMapping, canalizeAura, toggleChanneling,
    };
};
