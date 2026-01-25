import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 1,
    tables: [
        // ========== CORE TABLES ==========
        tableSchema({
            name: 'profiles',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'username', type: 'string', isOptional: true },
                { name: 'oro', type: 'number' },
                { name: 'xp_intelecto', type: 'number' },
                { name: 'xp_vigor', type: 'number' },
                { name: 'xp_hechiceria', type: 'number' },
                { name: 'xp_carisma', type: 'number' },
                { name: 'xp_destreza', type: 'number' },
                { name: 'avatar_url', type: 'string', isOptional: true },
                { name: 'shame_count', type: 'number' },
                { name: 'total_study_minutes', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'grimorios',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'nombre', type: 'string' },
                { name: 'descripcion', type: 'string', isOptional: true },
                { name: 'color', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'misiones',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'grimorio_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'titulo', type: 'string' },
                { name: 'descripcion', type: 'string', isOptional: true },
                { name: 'dificultad', type: 'string', isOptional: true },
                { name: 'rama', type: 'string', isOptional: true },
                { name: 'completada', type: 'boolean' },
                { name: 'oro_recompensa', type: 'number' },
                { name: 'xp_recompensa', type: 'number' },
                { name: 'due_at', type: 'number', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== LIBRARY SYSTEM ==========
        tableSchema({
            name: 'subjects',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'color', type: 'string' },
                { name: 'course', type: 'string', isOptional: true },
                { name: 'is_completed', type: 'boolean' },
                { name: 'total_minutes_studied', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'books',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'author', type: 'string', isOptional: true },
                { name: 'total_pages', type: 'number' },
                { name: 'current_page', type: 'number' },
                { name: 'cover_color', type: 'string' },
                { name: 'is_finished', type: 'boolean' },
                { name: 'finished_at', type: 'number', isOptional: true },
                { name: 'saga', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'study_sessions',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'subject_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'book_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'activity_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'start_time', type: 'number' },
                { name: 'end_time', type: 'number', isOptional: true },
                { name: 'duration_minutes', type: 'number' },
                { name: 'mode', type: 'string', isOptional: true },
                { name: 'notes', type: 'string', isOptional: true },
                { name: 'status', type: 'string' },
                { name: 'difficulty', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== THEATRE SYSTEM ==========
        tableSchema({
            name: 'theatre_activities',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'theatre_movies',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'director', type: 'string', isOptional: true },
                { name: 'saga', type: 'string', isOptional: true },
                { name: 'comment', type: 'string', isOptional: true },
                { name: 'rating', type: 'number', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'theatre_series',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'theatre_seasons',
            columns: [
                { name: 'series_id', type: 'string', isIndexed: true },
                { name: 'season_number', type: 'number' },
                { name: 'episodes_count', type: 'number', isOptional: true },
                { name: 'comment', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== BARRACKS (TRAINING) SYSTEM ==========
        tableSchema({
            name: 'exercises',
            columns: [
                { name: 'name_es', type: 'string' },
                { name: 'name_en', type: 'string', isOptional: true },
                { name: 'category', type: 'string', isOptional: true },
                { name: 'equipment', type: 'string', isOptional: true },
                { name: 'difficulty', type: 'string', isOptional: true },
                { name: 'muscle_heads', type: 'string' }, // JSON string
                { name: 'intensity_factor', type: 'number' },
                { name: 'is_popular', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'user_exercise_favorites',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'exercise_id', type: 'string', isIndexed: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'routines',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'routine_exercises',
            columns: [
                { name: 'routine_id', type: 'string', isIndexed: true },
                { name: 'exercise_id', type: 'string', isIndexed: true },
                { name: 'order_index', type: 'number' },
                { name: 'target_sets', type: 'number' },
                { name: 'target_reps', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'workout_sessions',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'routine_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'started_at', type: 'number' },
                { name: 'ended_at', type: 'number', isOptional: true },
                { name: 'bodyweight', type: 'number', isOptional: true },
                { name: 'note', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'workout_sets',
            columns: [
                { name: 'session_id', type: 'string', isIndexed: true },
                { name: 'exercise_id', type: 'string', isIndexed: true },
                { name: 'set_number', type: 'number' },
                { name: 'weight_kg', type: 'number' },
                { name: 'reps', type: 'number' },
                { name: 'rpe', type: 'number', isOptional: true },
                { name: 'type', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== ROYAL DECREES (CALENDAR) ==========
        tableSchema({
            name: 'royal_decrees',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'decree_type', type: 'string' },
                { name: 'start_date', type: 'number' },
                { name: 'end_date', type: 'number', isOptional: true },
                { name: 'stylist', type: 'string', isOptional: true },
                { name: 'subject_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'calendar_event_id', type: 'string', isOptional: true },
                { name: 'parent_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== TEMPLE SYSTEM ==========
        tableSchema({
            name: 'temple_prayers',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'prayer_type', type: 'string' },
                { name: 'duration_minutes', type: 'number' },
                { name: 'notes', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== TAVERN SYSTEM ==========
        tableSchema({
            name: 'tavern_quests',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'reward_oro', type: 'number' },
                { name: 'is_completed', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== MAGE TOWER (DESKTOP) ==========
        tableSchema({
            name: 'mage_themes',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'theme_name', type: 'string' },
                { name: 'mana_amount', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'detected_apps',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'app_name', type: 'string', isIndexed: true },
                { name: 'theme_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'computer_activities',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'app_name', type: 'string', isIndexed: true },
                { name: 'duration_seconds', type: 'number' },
                { name: 'state', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'active_aura_channeling',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'theme_id', type: 'string', isIndexed: true },
                { name: 'started_at', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),

        // ========== DISCIPLINE PROTOCOLS ==========
        tableSchema({
            name: 'discipline_protocols',
            columns: [
                { name: 'user_id', type: 'string', isIndexed: true },
                { name: 'protocol_name', type: 'string' },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'is_active', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                { name: 'synced_at', type: 'number', isOptional: true },
            ],
        }),
    ],
});
