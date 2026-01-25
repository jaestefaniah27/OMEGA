import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import { supabase } from '../lib/supabase';

export const SyncService = {
    async sync() {
        await synchronize({
            database,
            pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
                const { data, error } = await supabase.rpc('pull_changes', {
                    last_pulled_at: lastPulledAt ? new Date(lastPulledAt).toISOString() : null,
                });

                if (error) {
                    console.error('Pull changes error:', error);
                    throw new Error(`Pull error: ${error.message}`);
                }

                const { changes, timestamp } = data;
                return { changes, timestamp };
            },
            pushChanges: async ({ changes, lastPulledAt }) => {
                for (const table in changes) {
                    const { created, updated, deleted } = changes[table];

                    // Helper to remove internal fields
                    const sanitize = (record: any) => {
                        const { _status, _changed, ...cleanRecord } = record;
                        return {
                            ...cleanRecord,
                            updated_at: new Date().toISOString(),
                        };
                    };

                    // Push Created
                    if (created.length > 0) {
                        const { error } = await supabase.from(table).upsert(created.map(sanitize));
                        if (error) throw error;
                    }

                    // Push Updated
                    if (updated.length > 0) {
                        const { error } = await supabase.from(table).upsert(updated.map(sanitize));
                        if (error) throw error;
                    }

                    // Push Deleted
                    if (deleted.length > 0) {
                        const { error } = await supabase.from(table).delete().in('id', deleted);
                        if (error) throw error;
                    }
                }
            },
            // migrationsEnabledAtVersion: 1,
        });
    },
};
