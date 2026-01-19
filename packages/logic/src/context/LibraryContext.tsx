import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Subject, Book, CustomColor } from '../types/supabase';
import { showGlobalToast } from './ToastContext';

const LIBRARY_STORAGE_KEY = '@omega_library_v1';

interface LibraryContextType {
    subjects: Subject[];
    books: Book[];
    customColors: CustomColor[];
    bookStats: Record<string, number>;
    loading: boolean;

    // Mutations
    addSubject: (name: string, color: string, course?: string) => Promise<any>;
    updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
    addBook: (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => Promise<any>;
    updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
    saveCustomColor: (hex_code: string, name?: string) => Promise<any>;
    refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
};

export const LibraryProvider = ({ children, userId }: { children: ReactNode; userId: string | undefined }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [customColors, setCustomColors] = useState<CustomColor[]>([]);
    const [bookStats, setBookStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const fetchLibrary = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const [subjectsRes, booksRes, colorsRes, sessionsRes] = await Promise.all([
                supabase.from('subjects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('books').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('custom_colors').select('*').eq('user_id', userId),
                supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', userId)
            ]);

            const subData = subjectsRes.data || [];
            const bookData = booksRes.data || [];
            const colData = colorsRes.data || [];
            const sessData = sessionsRes.data || [];

            // Calculate book stats
            const bStats: Record<string, number> = {};
            sessData.forEach((s: any) => {
                if (s.book_id) {
                    bStats[s.book_id] = (bStats[s.book_id] || 0) + s.duration_minutes;
                }
            });

            setSubjects(subData);
            setBooks(bookData);
            setCustomColors(colData);
            setBookStats(bStats);
        } catch (error) {
            console.error('LibraryContext: Fetch Error', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    const addSubject = async (name: string, color: string, course?: string) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('subjects')
            .insert({ user_id: userId, name, color, course })
            .select()
            .single();

        if (error) {
            showGlobalToast('Error al crear materia', 'error');
            throw error;
        }

        setSubjects(prev => [data, ...prev]);
        showGlobalToast('Materia creada', 'success');
        return data;
    };

    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        const { error } = await supabase
            .from('subjects')
            .update(updates)
            .eq('id', id);

        if (error) {
            showGlobalToast('Error al actualizar materia', 'error');
            throw error;
        }

        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        showGlobalToast('Materia actualizada', 'success');
    };

    const addBook = async (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('books')
            .insert({ user_id: userId, title, author, total_pages, cover_color, saga, saga_index })
            .select()
            .single();

        if (error) {
            showGlobalToast('Error al crear libro', 'error');
            throw error;
        }

        setBooks(prev => [data, ...prev]);
        showGlobalToast('Libro creado', 'success');
        return data;
    };

    const updateBook = async (id: string, updates: Partial<Book>) => {
        const { error } = await supabase
            .from('books')
            .update(updates)
            .eq('id', id);

        if (error) {
            showGlobalToast('Error al actualizar libro', 'error');
            throw error;
        }

        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        showGlobalToast('Libro actualizado', 'success');
    };

    const saveCustomColor = async (hex_code: string, name?: string) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('custom_colors')
            .insert({ user_id: userId, hex_code, name })
            .select()
            .single();

        if (error) {
            showGlobalToast('Error al guardar color', 'error');
            throw error;
        }

        setCustomColors(prev => [...prev, data]);
        return data;
    };

    const value: LibraryContextType = {
        subjects,
        books,
        customColors,
        bookStats,
        loading,
        addSubject,
        updateSubject,
        addBook,
        updateBook,
        saveCustomColor,
        refresh: fetchLibrary
    };

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};
