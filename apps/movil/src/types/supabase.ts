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

export interface StudySession {
    id: string;
    user_id: string;
    subject_id: string;
    start_time: string;
    end_time: string | null;
    duration_minutes: number;
    mode: 'TIMER' | 'STOPWATCH';
    status: 'COMPLETED' | 'ABANDONED';
    difficulty: 'EXPLORER' | 'CRUSADE';
    notes: string | null;
    created_at: string;
}
