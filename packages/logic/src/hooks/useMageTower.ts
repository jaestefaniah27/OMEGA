import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Q } from '@nozbe/watermelondb';
import { MageTheme, MageProject, AppAuraMapping } from '../database/models';

export const useMageTower = () => {
    const { user, database: db, sync } = useGame();
    const [themes, setThemes] = useState<MageTheme[]>([]);
    const [projects, setProjects] = useState<MageProject[]>([]);
    const [mappings, setMappings] = useState<AppAuraMapping[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const themeSub = db.get<MageTheme>('mage_themes').query(Q.where('user_id', user.id)).observe().subscribe(records => {
            setThemes(records);
            setLoading(false);
        });

        const projectSub = db.get<MageProject>('mage_projects').query(Q.where('user_id', user.id)).observe().subscribe(setProjects);

        const mappingSub = db.get<AppAuraMapping>('app_aura_mappings').query(Q.where('user_id', user.id)).observe().subscribe(setMappings);

        return () => {
            themeSub.unsubscribe();
            projectSub.unsubscribe();
            mappingSub.unsubscribe();
        };
    }, [user]);

    const unhandledAuraByTheme = themes.reduce((acc, t) => {
        acc[t.id] = t.pending_aura || 0;
        return acc;
    }, {} as Record<string, number>);

    const createTheme = async (name: string, symbol: string, color: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<MageTheme>('mage_themes').create(t => {
                t.user_id = user.id;
                t.name = name;
                t.symbol = symbol;
                t.color = color;
                t.pending_aura = 0;
            });
        });
    };

    const deleteTheme = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<MageTheme>('mage_themes').find(id);
            await record.markAsDeleted();
        });
    };

    const createProject = async (name: string, themeId: string) => {
        if (!user) return;
        return await db.write(async () => {
            return await db.get<MageProject>('mage_projects').create(p => {
                p.user_id = user.id;
                p.theme_id = themeId;
                p.name = name;
                p.target_aura = 36000;
                p.current_aura = 0;
            });
        });
    };

    const updateProject = async (id: string, updates: any) => {
        await db.write(async () => {
            const project = await db.get<MageProject>('mage_projects').find(id);
            await project.update(p => { Object.assign(p, updates); });
        });
    };

    const deleteProject = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<MageProject>('mage_projects').find(id);
            await record.markAsDeleted();
        });
    };

    const canalizeAura = async (themeId: string, projectId: string, amount: number) => {
        await db.write(async () => {
            const theme = await db.get<MageTheme>('mage_themes').find(themeId);
            const project = await db.get<MageProject>('mage_projects').find(projectId);

            if ((theme.pending_aura || 0) < amount) throw new Error("Aura insuficiente");

            await theme.update(t => { t.pending_aura = (t.pending_aura || 0) - amount; });
            await project.update(p => { p.current_aura += amount; });
        });
    };

    const deleteMapping = async (id: string) => {
        await db.write(async () => {
            const record = await db.get<AppAuraMapping>('app_aura_mappings').find(id);
            await record.markAsDeleted();
        });
    };

    const toggleChanneling = async (projectId: string, themeId: string) => {
        // Implementation for toggling channeling if needed, or just canalize
        await canalizeAura(themeId, projectId, unhandledAuraByTheme[themeId] || 0);
    };

    return {
        themes,
        projects,
        mappings,
        unhandledAuraByTheme,
        loading,
        createTheme,
        deleteTheme,
        createProject,
        updateProject,
        deleteProject,
        canalizeAura,
        deleteMapping,
        toggleChanneling,
        refresh: sync
    };
};
