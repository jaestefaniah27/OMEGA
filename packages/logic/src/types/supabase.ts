export interface Profile {
    id: string;
    username: string | null;
    class: string;
    level: number;
    current_xp: number;
    max_xp: number;
    hp_current: number;
    hp_max: number;
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
    exams: Exam[];
    final_grade: number | null;
    created_at: string;
}

export interface Exam {
    id: string;
    title: string;
    date: string;
    time?: string;
    place?: string;
    weight: number; // 0-100
    grade: number | null; // 0-10
    is_completed: boolean;
    decree_id: string | null;
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

// --- TRAINING SYSTEM ---

export interface Exercise {
    id: string;
    name: string;
    name_es: string | null;
    primary_muscles: string[];
    secondary_muscles: string[];
    equipment: string;
    category: string;
    intensity_factor: number;
    bodyweight_factor: number;
    is_popular: boolean;
    muscle_heads?: any[];
}

export interface Routine {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string | null;
    created_at: string;
}

export interface RoutineExercise {
    id: string;
    routine_id: string;
    exercise_id: string;
    order_index: number;
    target_sets: number;
    target_reps: number;
    created_at: string;
}

export interface WorkoutSession {
    id: string;
    user_id: string;
    routine_id: string | null;
    started_at: string;
    ended_at: string | null;
    bodyweight: number | null;
    note: string | null;
    created_at: string;
}

export interface WorkoutSet {
    id: string;
    session_id: string;
    exercise_id: string;
    set_number: number;
    weight_kg: number;
    reps: number;
    rpe: number | null;
    type: 'warmup' | 'normal' | 'failure';
    created_at: string;
}

export interface MuscleFatigue {
    [muscle: string]: number;
}

export interface PersonalRecord {
    exercise_id: string;
    exercise_name: string;
    max_weight: number;
    achieved_at: string;
}

// --- ROYAL DECREES SYSTEM ---

export type DecreeType = 'GENERAL' | 'THEATRE' | 'LIBRARY' | 'BARRACKS' | 'CALENDAR_EVENT' | 'EXAM';
export type DecreeStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type DecreeUnit = 'MINUTES' | 'PAGES' | 'SESSIONS';

export interface RoyalDecree {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    type: DecreeType;
    status: DecreeStatus;
    required_activity_tag: string | null;
    target_quantity: number;
    current_quantity: number;
    unit: DecreeUnit;
    due_date: string | null;
    recurrence: any;
    parent_id: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface RoutineWithExercises extends Routine {
    exercises: (RoutineExercise & { exercise: Exercise })[];
}

// --- TEMPLE SYSTEM ---

export type ThoughtType = 'POSITIVE' | 'NEGATIVE';

export interface TempleThought {
    id: string;
    user_id: string;
    content: string;
    type: ThoughtType;
    is_resolved: boolean;
    date: string;
    created_at: string;
}

export interface TempleSleep {
    id: string;
    user_id: string;
    hours: number;
    quality: string | null;
    date: string;
    created_at: string;
}

// --- TAVERN SYSTEM ---

export interface TavernWater {
    id: string;
    user_id: string;
    amount: number;
    date: string;
    created_at: string;
}

// --- MAGE TOWER SYSTEM ---

export interface MageProject {
    id: string;
    user_id: string;
    name: string;
    scope: string | null;
    theme_id: string | null;
    mana_amount: number;
    status: 'ACTIVE' | 'ARCHIVED';
    created_at: string;
}

export interface MageTheme {
    id: string;
    user_id: string;
    name: string;
    symbol: string;
    color: string;
    pending_aura?: number;
    active_project_id?: string | null;
    created_at: string;
}

export interface WorkerCommand {
    id: string;
    user_id: string;
    command_type: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    payload: any;
    response: any;
    created_at: string;
}

export interface MageAppMapping {
    id: string;
    user_id: string;
    process_name: string;
    theme_id: string;
    created_at: string;
}

// --- DISCIPLINE PROTOCOLS (HABITS) ---

export type ScheduleType = 'daily' | 'specific_days' | 'weekly_quota';

export interface DailyRitual {
    id: number;
    user_id: string;
    title: string;
    icon: string;
    schedule_type: ScheduleType;
    active_days: number[];
    weekly_target: number;
    activity_type: string | null;
    activity_tag: string | null;
    target_value: number;
    unit: 'MINUTES' | 'PAGES' | 'SESSIONS';
    current_streak: number;
    is_active: boolean;
    created_at: string;
}

export interface RitualLog {
    id: number;
    ritual_id: number;
    user_id: string;
    date: string;
    current_value: number;
    target_value: number;
    completed: boolean;
    definition?: DailyRitual;
}
