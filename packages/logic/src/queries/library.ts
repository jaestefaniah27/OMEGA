import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { qk } from './keys';
import { useAuthUser } from './useAuthUser';
import { Subject, Book, CustomColor } from '../types/supabase';

interface LibraryData {
    subjects: Subject[];
    books: Book[];
    customColors: CustomColor[];
    bookStats: Record<string, number>;
}

// Datos de la Biblioteca vía React Query. queryFn = los mismos selects que
// estaban en GameContext.fetchAll. Mutaciones invalidan SOLO ['library'].
export const useLibraryData = () => {
    const { data: user } = useAuthUser();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: qk.library,
        enabled: !!userId,
        queryFn: async (): Promise<LibraryData> => {
            const [subRes, bookRes, colRes, sessRes] = await Promise.all([
                supabase.from('subjects').select('*').order('created_at', { ascending: false }),
                supabase.from('books').select('*').order('created_at', { ascending: false }),
                supabase.from('custom_colors').select('*').order('created_at', { ascending: false }),
                supabase.from('study_sessions').select('book_id, duration_minutes').eq('user_id', userId).not('book_id', 'is', null),
            ]);
            const bookStats: Record<string, number> = {};
            (sessRes.data ?? []).forEach((s: any) => {
                if (s.book_id) bookStats[s.book_id] = (bookStats[s.book_id] || 0) + s.duration_minutes;
            });
            return {
                subjects: subRes.data ?? [],
                books: bookRes.data ?? [],
                customColors: colRes.data ?? [],
                bookStats,
            };
        },
    });

    const data = query.data ?? { subjects: [], books: [], customColors: [], bookStats: {} };
    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.library });

    const addSubject = async (name: string, color: string, course?: string) => {
        if (!userId) return;
        const { data: row } = await supabase.from('subjects').insert([{ name, color, course, user_id: userId }]).select().single();
        invalidate();
        return row;
    };
    const updateSubject = async (id: string, updates: Partial<Subject>) => {
        await supabase.from('subjects').update(updates).eq('id', id);
        invalidate();
    };
    const addBook = async (title: string, author: string, total_pages: number, cover_color: string, saga?: string, saga_index?: number) => {
        if (!userId) return;
        const { data: row } = await supabase.from('books').insert([{ title, author, total_pages, cover_color, saga, saga_index, user_id: userId }]).select().single();
        invalidate();
        return row;
    };
    const updateBook = async (id: string, updates: Partial<Book>) => {
        await supabase.from('books').update(updates).eq('id', id);
        invalidate();
    };
    const saveCustomColor = async (hex_code: string, name?: string) => {
        if (!userId) return;
        const { data: row } = await supabase.from('custom_colors').insert([{ hex_code, name, user_id: userId }]).select().single();
        invalidate();
        return row;
    };

    return {
        subjects: data.subjects,
        books: data.books,
        customColors: data.customColors,
        bookStats: data.bookStats,
        loading: query.isLoading,
        refresh: invalidate,
        addSubject,
        updateSubject,
        addBook,
        updateBook,
        saveCustomColor,
    };
};
