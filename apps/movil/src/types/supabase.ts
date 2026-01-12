export interface Profile {
    id: string;
    username: string | null;
    class: string;
    level: number;
    current_xp: number;
    max_xp: number;
    hp_current: number;
    gold: number;
    current_status: string;
    avatar_url: string | null;
    updated_at: string;
    shame_count: number;
    total_study_minutes: number;
}

export interface Subject {
    id: string;
    user_id: string;
    name: string;
    color: string;
    course: string | null;
    is_completed: boolean;
    total_minutes_studied: number;
    created_at: string;
}

export interface Book {
    id: string;
    user_id: string;
    title: string;
    author: string | null;
    saga: string | null;
    saga_index: number | null;
    total_pages: number;
    current_page: number;
    cover_color: string;
    is_finished: boolean;
    finished_at: string | null;
    created_at: string;
}

export interface TheatreActivity {
    id: string;
    user_id: string;
    name: string;
    total_minutes: number;
    days_count: number;
    created_at: string;
}

export interface TheatreMovie {
    id: string;
    user_id: string;
    title: string;
    director: string | null;
    saga: string | null;
    comment: string | null;
    rating: number;
    created_at: string;
}

export interface TheatreSeries {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
}

export interface TheatreSeason {
    id: string;
    series_id: string;
    season_number: number;
    episodes_count: number | null;
    comment: string | null;
    rating: number;
    created_at: string;
}

export interface StudySession {
    id: string;
    user_id: string;
    subject_id?: string; // Now optional (nullable)
    book_id?: string;    // New field
    activity_id?: string; // Theater field
    start_time: string;
    end_time: string | null;
    duration_minutes: number;
    mode: 'TIMER' | 'STOPWATCH';
    status: 'COMPLETED' | 'ABANDONED';
    difficulty: 'EXPLORER' | 'CRUSADE';
    notes: string | null;
    created_at: string;
}

export interface CustomColor {
    id: string;
    user_id: string;
    hex_code: string;
    name: string | null;
    created_at: string;
}
