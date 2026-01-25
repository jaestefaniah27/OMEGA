import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'subjects',
                    columns: [
                        { name: 'exams', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'books',
                    columns: [
                        { name: 'finished_at', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'mage_themes',
                    columns: [
                        { name: 'active_project_id', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'mage_projects',
                    columns: [
                        { name: 'scope', type: 'string', isOptional: true },
                        { name: 'mana_amount', type: 'number' },
                        { name: 'status', type: 'string' },
                    ],
                }),
                addColumns({
                    table: 'royal_decrees',
                    columns: [
                        { name: 'description', type: 'string', isOptional: true },
                        { name: 'unit', type: 'string' },
                        { name: 'parent_id', type: 'string', isOptional: true },
                        { name: 'completed_at', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
    ],
});
