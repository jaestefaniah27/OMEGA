import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class Profile extends Model {
    static table = 'profiles'
    @text('username') username?: string
    @text('class') class!: string
    @field('level') level!: number
    @field('current_xp') current_xp!: number
    @field('max_xp') max_xp!: number
    @field('hp_current') hp_current!: number
    @field('hp_max') hp_max!: number
    @field('gold') gold!: number
    @text('current_status') current_status!: string
    @text('avatar_url') avatar_url?: string
    @field('shame_count') shame_count!: number
    @field('total_study_minutes') total_study_minutes!: number
    @readonly @date('created_at') created_at!: Date
    @readonly @date('updated_at') updated_at!: Date
}

export class UserStats extends Model {
    static table = 'user_stats'
    @field('mastery_xp') mastery_xp!: number
    @field('mastery_level') mastery_level!: number
    @field('wisdom_xp') wisdom_xp!: number
    @field('wisdom_level') wisdom_level!: number
    @field('vigor_xp') vigor_xp!: number
    @field('vigor_level') vigor_level!: number
    @field('discipline_xp') discipline_xp!: number
    @field('discipline_level') discipline_level!: number
    @field('global_level') global_level!: number
    @field('cronolitos_balance') cronolitos_balance!: number
    @readonly @date('created_at') created_at!: Date
    @readonly @date('updated_at') updated_at!: Date
}

export class Subject extends Model {
    static table = 'subjects';
    @text('user_id') user_id!: string;
    @text('name') name!: string;
    @text('color') color!: string;
    @text('course') course?: string;
    @field('total_minutes_studied') total_minutes_studied!: number;
    @field('is_completed') is_completed!: boolean;
    @field('final_grade') final_grade?: number;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class Book extends Model {
    static table = 'books';
    @text('user_id') user_id!: string;
    @text('title') title!: string;
    @text('author') author!: string;
    @field('total_pages') total_pages!: number;
    @field('current_page') current_page!: number;
    @text('cover_color') cover_color!: string;
    @text('saga') saga?: string;
    @field('saga_index') saga_index!: number;
    @field('is_finished') is_finished!: boolean;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class CustomColor extends Model {
    static table = 'custom_colors';
    @text('user_id') user_id!: string;
    @text('hex_code') hex_code!: string;
    @text('name') name?: string;
}

export class StudySession extends Model {
    static table = 'study_sessions';
    @text('user_id') user_id!: string;
    @text('subject_id') subject_id?: string;
    @text('book_id') book_id?: string;
    @text('activity_id') activity_id?: string;
    @text('start_time') start_time!: string;
    @text('end_time') end_time!: string;
    @field('duration_minutes') duration_minutes!: number;
    @text('status') status!: string;
    @text('difficulty') difficulty!: string;
    @text('mode') mode!: string;
    @text('notes') notes?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class Routine extends Model {
    static table = 'routines';
    @text('user_id') user_id!: string;
    @text('name') name!: string;
    @text('description') description?: string;
    @text('category') category?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class RoutineExercise extends Model {
    static table = 'routine_exercises';
    @text('routine_id') routine_id!: string;
    @text('exercise_id') exercise_id!: string;
    @field('order_index') order_index!: number;
    @field('target_sets') target_sets!: number;
    @field('target_reps') target_reps!: number;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class Exercise extends Model {
    static table = 'exercises';
    @text('name') name!: string;
    @text('name_es') name_es?: string;
    @text('category') category!: string;
    @text('equipment') equipment!: string;
    @field('intensity_factor') intensity_factor!: number;
    @field('bodyweight_factor') bodyweight_factor!: number;
    @field('is_popular') is_popular!: boolean;
    @field('is_favorite') is_favorite!: boolean;
    @readonly @date('updated_at') updated_at!: Date;
}

export class WorkoutSession extends Model {
    static table = 'workout_sessions';
    @text('user_id') user_id!: string;
    @text('routine_id') routine_id?: string;
    @field('started_at') started_at!: number;
    @field('ended_at') ended_at?: number;
    @field('bodyweight') bodyweight?: number;
    @text('note') note?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class WorkoutSet extends Model {
    static table = 'workout_sets';
    @text('session_id') session_id!: string;
    @text('exercise_id') exercise_id!: string;
    @field('set_number') set_number!: number;
    @field('weight_kg') weight_kg!: number;
    @field('reps') reps!: number;
    @field('rpe') rpe?: number;
    @text('type') type!: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TheatreActivity extends Model {
    static table = 'theatre_activities';
    @text('user_id') user_id!: string;
    @text('name') name!: string;
    @field('total_minutes') total_minutes!: number;
    @field('days_count') days_count!: number;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TheatreMovie extends Model {
    static table = 'theatre_movies';
    @text('user_id') user_id!: string;
    @text('title') title!: string;
    @text('director') director?: string;
    @text('saga') saga?: string;
    @field('rating') rating!: number;
    @text('comment') comment?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TheatreSeries extends Model {
    static table = 'theatre_series';
    @text('user_id') user_id!: string;
    @text('title') title!: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TheatreSeason extends Model {
    static table = 'theatre_seasons';
    @text('series_id') series_id!: string;
    @field('season_number') season_number!: number;
    @field('episodes_count') episodes_count!: number;
    @field('rating') rating!: number;
    @text('comment') comment?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TempleThought extends Model {
    static table = 'temple_thoughts';
    @text('user_id') user_id!: string;
    @text('content') content!: string;
    @text('type') type!: string;
    @field('is_resolved') is_resolved!: boolean;
    @field('is_encrypted') is_encrypted!: boolean;
    @text('date') date!: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TempleSleep extends Model {
    static table = 'temple_sleep';
    @text('user_id') user_id!: string;
    @field('hours') hours!: number;
    @text('quality') quality?: string;
    @text('date') date!: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class TavernWater extends Model {
    static table = 'tavern_water';
    @text('user_id') user_id!: string;
    @field('amount') amount!: number;
    @text('date') date!: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class MageTheme extends Model {
    static table = 'mage_themes';
    @text('user_id') user_id!: string;
    @text('name') name!: string;
    @text('symbol') symbol!: string;
    @text('color') color!: string;
    @field('pending_aura') pending_aura!: number;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class MageProject extends Model {
    static table = 'mage_projects';
    @text('user_id') user_id!: string;
    @text('theme_id') theme_id!: string;
    @text('name') name!: string;
    @field('target_aura') target_aura!: number;
    @field('current_aura') current_aura!: number;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class RoyalDecree extends Model {
    static table = 'royal_decrees';
    @text('user_id') user_id!: string;
    @text('title') title!: string;
    @text('description') description?: string;
    @text('type') type!: string;
    @text('status') status!: string;
    @field('target_quantity') target_quantity!: number;
    @field('current_quantity') current_quantity!: number;
    @text('unit') unit!: string;
    @text('parent_id') parent_id?: string;
    @text('due_date') due_date?: string;
    @text('completed_at') completed_at?: string;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class DailyRitual extends Model {
    static table = 'daily_rituals';
    @text('user_id') user_id!: string;
    @text('name') name!: string;
    @text('icon') icon!: string;
    @text('schedule_type') schedule_type!: string;
    @field('weekly_target') weekly_target!: number;
    @text('activity_type') activity_type?: string;
    @text('activity_tag') activity_tag?: string;
    @field('target_value') target_value!: number;
    @text('unit') unit!: string;
    @field('current_streak') current_streak!: number;
    @field('is_active') is_active!: boolean;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}

export class RitualLog extends Model {
    static table = 'ritual_logs';
    @text('user_id') user_id!: string;
    @text('ritual_id') ritual_id!: string;
    @text('date') date!: string;
    @field('current_value') current_value!: number;
    @field('target_value') target_value!: number;
    @field('completed') completed!: boolean;
    @readonly @date('created_at') created_at!: Date;
    @readonly @date('updated_at') updated_at!: Date;
}


export class AppAuraMapping extends Model {
    static table = 'app_aura_mappings';
    @text('user_id') user_id!: string;
    @text('process_name') process_name!: string;
    @text('theme_id') theme_id!: string;
    @readonly @date('created_at') created_at!: Date;
}
