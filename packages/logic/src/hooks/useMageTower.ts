import { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export const useMageTower = () => {
    const { mageTower } = useGame();

    const activeProjects = useMemo(() => {
        return mageTower.projects.filter(p => p.status === 'ACTIVE');
    }, [mageTower.projects]);

    const createProject = async (name: string, scope: string) => {
        return await mageTower.addProject(name, scope);
    };

    const archiveProject = async (id: string) => {
        return await mageTower.updateProject(id, { status: 'ARCHIVED' });
    };

    return {
        projects: activeProjects,
        themes: mageTower.themes,
        createProject,
        updateProject: mageTower.updateProject,
        deleteProject: mageTower.deleteProject,
        archiveProject,
        createTheme: mageTower.addTheme,
        deleteTheme: mageTower.deleteTheme,
        loading: mageTower.loading,
        refresh: mageTower.refresh
    };
};
