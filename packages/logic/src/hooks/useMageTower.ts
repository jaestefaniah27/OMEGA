import { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export const useMageTower = () => {
    const { mageTower } = useGame();



    const createProject = async (name: string, scope: string) => {
        return await mageTower.addProject(name, scope);
    };

    const archiveProject = async (id: string) => {
        return await mageTower.updateProject(id, { status: 'ARCHIVED' });
    };

    return {
        projects: mageTower.projects,
        themes: mageTower.themes,
        createProject,
        updateProject: mageTower.updateProject,
        deleteProject: mageTower.deleteProject,
        archiveProject,
        createTheme: mageTower.addTheme,
        deleteTheme: mageTower.deleteTheme,
        loading: mageTower.loading,
        refresh: mageTower.refresh,
        mappings: mageTower.mappings,
        unhandledAuraByTheme: mageTower.unhandledAuraByTheme,
        canalizeAura: mageTower.canalizeAura,
        toggleChanneling: mageTower.toggleChanneling,
        deleteMapping: mageTower.deleteMapping
    };
};
