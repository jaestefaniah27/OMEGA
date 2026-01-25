// ========== BARRACKS (TRAINING) MODELS ==========

import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export class Exercise extends Model {
    static table = 'exercises';

    static associations = {
        routine_exercises: { type: 'has_many' as const, foreignKey: 'exercise_id' },
        workout_sets: { type: 'has_many' as const, foreignKey: 'exercise_id' },
        user_exercise_favorites: { type: 'has_many' as const, foreignKey: 'exercise_id' },
    };

    @field('name_es') nameEs!: string;
    @field('name_en') nameEn?: string;
    @field('category') category?: string;
    @field('equipment') equipment?: string;
    @field('difficulty') difficulty?: string;
    @field('muscle_heads') muscleHeads!: string; // JSON string
    @field('intensity_factor') intensityFactor!: number;
    @field('is_popular') isPopular!: boolean;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class UserExerciseFavorite extends Model {
    static table = 'user_exercise_favorites';

    @field('user_id') userId!: string;
    @field('exercise_id') exerciseId!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class Routine extends Model {
    static table = 'routines';

    static associations = {
        routine_exercises: { type: 'has_many' as const, foreignKey: 'routine_id' },
        workout_sessions: { type: 'has_many' as const, foreignKey: 'routine_id' },
    };

    @field('user_id') userId!: string;
    @field('name') name!: string;
    @field('description') description?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class RoutineExercise extends Model {
    static table = 'routine_exercises';

    @field('routine_id') routineId!: string;
    @field('exercise_id') exerciseId!: string;
    @field('order_index') orderIndex!: number;
    @field('target_sets') targetSets!: number;
    @field('target_reps') targetReps!: number;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class WorkoutSession extends Model {
    static table = 'workout_sessions';

    static associations = {
        workout_sets: { type: 'has_many' as const, foreignKey: 'session_id' },
    };

    @field('user_id') userId!: string;
    @field('routine_id') routineId?: string;
    @date('started_at') startedAt!: Date;
    @date('ended_at') endedAt?: Date;
    @field('bodyweight') bodyweight?: number;
    @field('note') note?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class WorkoutSet extends Model {
    static table = 'workout_sets';

    @field('session_id') sessionId!: string;
    @field('exercise_id') exerciseId!: string;
    @field('set_number') setNumber!: number;
    @field('weight_kg') weightKg!: number;
    @field('reps') reps!: number;
    @field('rpe') rpe?: number;
    @field('type') type!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

// ========== OTHER SYSTEMS ==========

export class RoyalDecree extends Model {
    static table = 'royal_decrees';

    @field('user_id') userId!: string;
    @field('title') title!: string;
    @field('description') description?: string;
    @field('decree_type') decreeType!: string;
    @date('start_date') startDate!: Date;
    @date('end_date') endDate?: Date;
    @field('stylist') stylist?: string;
    @field('subject_id') subjectId?: string;
    @field('calendar_event_id') calendarEventId?: string;
    @field('parent_id') parentId?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class TemplePrayer extends Model {
    static table = 'temple_prayers';

    @field('user_id') userId!: string;
    @field('prayer_type') prayerType!: string;
    @field('duration_minutes') durationMinutes!: number;
    @field('notes') notes?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class TavernQuest extends Model {
    static table = 'tavern_quests';

    @field('user_id') userId!: string;
    @field('title') title!: string;
    @field('description') description?: string;
    @field('reward_oro') rewardOro!: number;
    @field('is_completed') isCompleted!: boolean;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class MageTheme extends Model {
    static table = 'mage_themes';

    @field('user_id') userId!: string;
    @field('theme_name') themeName!: string;
    @field('mana_amount') manaAmount!: number;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class DetectedApp extends Model {
    static table = 'detected_apps';

    @field('user_id') userId!: string;
    @field('app_name') appName!: string;
    @field('theme_id') themeId?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class ComputerActivity extends Model {
    static table = 'computer_activities';

    @field('user_id') userId!: string;
    @field('app_name') appName!: string;
    @field('duration_seconds') durationSeconds!: number;
    @field('state') state!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class ActiveAuraChanneling extends Model {
    static table = 'active_aura_channeling';

    @field('user_id') userId!: string;
    @field('theme_id') themeId!: string;
    @date('started_at') startedAt!: Date;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}

export class DisciplineProtocol extends Model {
    static table = 'discipline_protocols';

    @field('user_id') userId!: string;
    @field('protocol_name') protocolName!: string;
    @field('description') description?: string;
    @field('is_active') isActive!: boolean;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}
