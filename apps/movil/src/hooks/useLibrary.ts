import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subject, StudySession } from '../types/supabase';

export const useLibrary = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error: fetchError } = await supabase
                .from('subjects')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setSubjects(data || []);

            // Subscribe to real-time changes
            const channel = supabase
                .channel('public:subjects')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${user.id}` },
                    (payload: any) => {
                        if (payload.eventType === 'INSERT') {
                            setSubjects(prev => [payload.new as Subject, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setSubjects(prev => prev.map(s => s.id === payload.new.id ? payload.new as Subject : s));
                        } else if (payload.eventType === 'DELETE') {
                            setSubjects(prev => prev.filter(s => s.id === payload.old.id));
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const addSubject = async (name: string, color: string, course?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { data, error } = await supabase
            .from('subjects')
            .insert([{ name, color, course, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        const { error } = await supabase
            .from('subjects')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    };

    const completeSubject = async (id: string) => {
        return updateSubject(id, { is_completed: true });
    };

    const logStudySession = async (session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        // 1. Insert session
        const { error: sessionError } = await supabase
            .from('study_sessions')
            .insert([{ ...session, user_id: user.id }]);

        if (sessionError) throw sessionError;

        // 2. Update total time in subject (if completed)
        if (session.status === 'COMPLETED') {
            const { data: subject } = await supabase
                .from('subjects')
                .select('total_minutes_studied')
                .eq('id', session.subject_id)
                .single();

            if (subject) {
                const newTotalSubject = (subject.total_minutes_studied || 0) + session.duration_minutes;
                await updateSubject(session.subject_id, { total_minutes_studied: newTotalSubject });

                // Update total in profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_study_minutes')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const newTotalProfile = (profile.total_study_minutes || 0) + session.duration_minutes;
                    await supabase
                        .from('profiles')
                        .update({ total_study_minutes: newTotalProfile })
                        .eq('id', user.id);
                }
            }
        }

        // 3. Update shame count if abandoned
        if (session.status === 'ABANDONED') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('shame_count')
                .eq('id', user.id)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ shame_count: (profile.shame_count || 0) + 1 })
                    .eq('id', user.id);
            }
        }
    };

    const activeSubjects = subjects.filter(s => !s.is_completed);
    const completedSubjects = subjects.filter(s => s.is_completed);

    return {
        subjects,
        activeSubjects,
        completedSubjects,
        loading,
        error,
        addSubject,
        updateSubject,
        completeSubject,
        logStudySession,
        refresh: fetchSubjects
    };
};
