import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PrivacyUtils } from '../utils/privacy';
import { TempleThought, TempleSleep } from '../database/models';
import { Q } from '@nozbe/watermelondb';

export const useTemple = () => {
    const { database, user } = useGame();
    const [thoughts, setThoughts] = useState<any[]>([]);
    const [sleepRecords, setSleepRecords] = useState<TempleSleep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const thoughtsSub = database.get<TempleThought>('temple_thoughts')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(records => {
                const decrypted = records.map(r => ({
                    id: r.id,
                    content: r.is_encrypted ? PrivacyUtils.decrypt(r.content, user.id) : r.content,
                    type: r.type,
                    is_resolved: r.is_resolved,
                    date: r.date,
                    _raw: r._raw
                }));
                setThoughts(decrypted);
                setLoading(false);
            });

        const sleepSub = database.get<TempleSleep>('temple_sleep')
            .query(Q.where('user_id', user.id))
            .observe()
            .subscribe(setSleepRecords);

        return () => {
            thoughtsSub.unsubscribe();
            sleepSub.unsubscribe();
        };
    }, [user]);

    const addThought = async (content: string, type: 'POSITIVE' | 'NEGATIVE') => {
        if (!user) return;
        const encryptedContent = PrivacyUtils.encrypt(content, user.id);

        await database.write(async () => {
            await database.get<TempleThought>('temple_thoughts').create(record => {
                record.user_id = user.id;
                record.content = encryptedContent;
                record.type = type;
                record.is_resolved = false;
                record.is_encrypted = true;
                record.date = new Date().toISOString().split('T')[0];
            });
        });
    };

    const resolveThought = async (id: string) => {
        await database.write(async () => {
            const record = await database.get<TempleThought>('temple_thoughts').find(id);
            await record.update(r => {
                r.is_resolved = true;
            });
        });
    };

    const addSleep = async (hours: number, quality?: string) => {
        if (!user) return;
        await database.write(async () => {
            await database.get<TempleSleep>('temple_sleep').create(record => {
                record.user_id = user.id;
                record.hours = hours;
                record.quality = quality || null;
                record.date = new Date().toISOString().split('T')[0];
            });
        });
    };

    return {
        positiveThoughts: thoughts.filter(t => t.type === 'POSITIVE'),
        negativeThoughts: thoughts.filter(t => t.type === 'NEGATIVE' && !t.is_resolved),
        resolvedThoughts: thoughts.filter(t => t.type === 'NEGATIVE' && t.is_resolved),
        todaySleep: sleepRecords.find(r => r.date === new Date().toISOString().split('T')[0]),
        loading,
        addGratitude: (content: string) => addThought(content, 'POSITIVE'),
        addWorry: (content: string) => addThought(content, 'NEGATIVE'),
        unleashWorry: (id: string) => resolveThought(id),
        registerSleep: (hours: number, quality?: string) => addSleep(hours, quality)
    };
};
