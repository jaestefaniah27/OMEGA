import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DailyRitual, RitualLog } from '../types/supabase';

export const useHabits = (userId: string | undefined) => {
    const [rituals, setRituals] = useState<DailyRitual[]>([]);
    const [todayLogs, setTodayLogs] = useState<RitualLog[]>([]);
    const [loading, setLoading] = useState(true);

    const logsRef = useRef<RitualLog[]>([]);

    const fetchHabits = useCallback(async (silent = false) => {
        if (!userId) return;
        // Only show full-screen loading if we don't have any data yet
        if (!silent && logsRef.current.length === 0) setLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Check if logs exist for today
            const { data: existingLogs, error: logError } = await supabase
                .from('ritual_logs')
                .select('*, definition:daily_rituals(*)')
                .eq('user_id', userId)
                .eq('date', today);

            if (logError) throw logError;

            if (existingLogs && existingLogs.length > 0) {
                logsRef.current = existingLogs;
                setTodayLogs(existingLogs);
                setLoading(false);
                return;
            }

            // 2. If no logs, run Lazy Creation
            const { data: definitions, error: defError } = await supabase
                .from('daily_rituals')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true);

            if (defError) throw defError;
            if (!definitions || definitions.length === 0) {
                setLoading(false);
                return;
            }

            const currentDay = new Date().getDay(); // 0=Sunday
            const newLogs = [];

            for (const ritual of definitions) {
                let shouldCreate = false;

                if (ritual.schedule_type === 'daily') {
                    shouldCreate = true;
                } else if (ritual.schedule_type === 'specific_days') {
                    shouldCreate = ritual.active_days.includes(currentDay);
                } else if (ritual.schedule_type === 'weekly_quota') {
                    // Check weekly progress
                    // We assume week starts on Monday (1)
                    const now = new Date();
                    const day = now.getDay();
                    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                    const monday = new Date(now.setDate(diff)).toISOString().split('T')[0];

                    const { count, error: countError } = await supabase
                        .from('ritual_logs')
                        .select('*', { count: 'exact', head: true })
                        .eq('ritual_id', ritual.id)
                        .eq('completed', true)
                        .gte('date', monday);

                    if (!countError && (count || 0) < ritual.weekly_target) {
                        shouldCreate = true;
                    }
                }

                if (shouldCreate) {
                    newLogs.push({
                        ritual_id: ritual.id,
                        user_id: userId,
                        date: today,
                        target_value: ritual.target_value,
                        current_value: 0,
                        completed: false
                    });
                }
            }

            if (newLogs.length > 0) {
                const { data: createdLogs, error: insertError } = await supabase
                    .from('ritual_logs')
                    .insert(newLogs)
                    .select('*, definition:daily_rituals(*)');

                if (insertError) throw insertError;
                logsRef.current = createdLogs || [];
                setTodayLogs(logsRef.current);
            }

            setRituals(definitions);
        } catch (error) {
            console.error('Error fetching habits:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const toggleHabit = async (logId: number, completed: boolean) => {
        try {
            const { error } = await supabase
                .from('ritual_logs')
                .update({
                    completed,
                    current_value: completed ? 1 : 0
                })
                .eq('id', logId);

            if (error) throw error;

            // Updated local state
            setTodayLogs(prev => prev.map(l => l.id === logId ? { ...l, completed, current_value: completed ? 1 : 0 } : l));

            // Logic for racha (streak) update
            if (completed) {
                const log = todayLogs.find(l => l.id === logId);
                if (log?.ritual_id) {
                    await supabase.rpc('increment_ritual_streak', { r_id: log.ritual_id });
                    await fetchHabits(true);
                }
            }
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const addRitual = async (ritual: Partial<DailyRitual>) => {
        try {
            const { data, error } = await supabase
                .from('daily_rituals')
                .insert([{ ...ritual, user_id: userId }])
                .select()
                .single();

            if (error) throw error;
            setRituals(prev => [...prev, data]);
            await fetchHabits(); // Recalculate logs for today
            return data;
        } catch (error) {
            console.error('Error adding ritual:', error);
            throw error;
        }
    };

    const checkHabitProgress = async (type: string, tag: string, amount: number, durationMinutes?: number, genericTag?: string) => {
        if (!userId || todayLogs.length === 0) return { totalXp: 0, totalGold: 0 };

        let updated = false;
        let totalXp = 0;
        let totalGold = 0;
        const today = new Date().toISOString().split('T')[0];

        const relevantLogs = todayLogs.filter(log => {
            const rit = log.definition;
            if (!rit || rit.activity_type !== type || log.completed) return false;

            // Normalize tags for robust matching
            const ritualTag = (rit.activity_tag || '').trim().toUpperCase();
            const specificTag = (tag || '').trim().toUpperCase();
            const generic = (genericTag || '').trim().toUpperCase();

            // Match if:
            // 1. Ritual has no tag (matches all of that type)
            // 2. Ritual tag matches specific activity ID
            // 3. Ritual tag matches generic category (e.g. 'READING', 'STUDY')
            return ritualTag === '' || ritualTag === specificTag || (generic !== '' && ritualTag === generic);
        });

        for (const log of relevantLogs) {
            const rit = log.definition!;
            const isTimeBased = rit.unit === 'MINUTES';

            // Ensure we use the right metric based on the habit unit
            const increment = isTimeBased ? (durationMinutes || 0) : amount;

            if (increment <= 0) continue;

            const newValue = log.current_value + increment;
            const isCompleted = newValue >= log.target_value;

            const { error } = await supabase
                .from('ritual_logs')
                .update({
                    current_value: newValue,
                    completed: isCompleted
                })
                .eq('id', log.id);

            if (!error) {
                updated = true;
                // Update streak and rewards if completed
                if (isCompleted) {
                    await supabase.rpc('increment_ritual_streak', { r_id: rit.id });

                    // Base Rewards: 25 XP, 5 Gold
                    let xp = 25;
                    let gold = 5;

                    // Streak bonus (10% extra per day of streak, max 100%)
                    const streakBonus = Math.min(1, (rit.current_streak || 0) * 0.1);
                    const finalXp = Math.floor(xp * (1 + streakBonus));

                    totalXp += finalXp;
                    totalGold += gold;
                }
            }
        }

        if (updated) {
            await fetchHabits();
        }

        return { totalXp, totalGold };
    };

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    return {
        rituals,
        todayLogs,
        loading,
        refresh: fetchHabits,
        toggleHabit,
        addRitual,
        checkHabitProgress
    };
};
