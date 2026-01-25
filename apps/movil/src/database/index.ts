import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';

// Import all models
import Profile from './models/Profile';
import Grimorio from './models/Grimorio';
import Mision from './models/Mision';
import Subject from './models/Subject';
import Book from './models/Book';
import StudySession from './models/StudySession';
import TheatreActivity from './models/TheatreActivity';
import TheatreMovie from './models/TheatreMovie';
import TheatreSeries from './models/TheatreSeries';
import TheatreSeason from './models/TheatreSeason';
import {
    Exercise,
    UserExerciseFavorite,
    Routine,
    RoutineExercise,
    WorkoutSession,
    WorkoutSet,
    RoyalDecree,
    TemplePrayer,
    TavernQuest,
    MageTheme,
    DetectedApp,
    ComputerActivity,
    ActiveAuraChanneling,
    DisciplineProtocol,
} from './models/OtherModels';

// Create the SQLite adapter
const adapter = new SQLiteAdapter({
    schema,
    // Optional: migrations will be added in Phase 2
    // migrations,
    jsi: true, // Use JSI for better performance on React Native
    onSetUpError: (error) => {
        console.error('WatermelonDB setup error:', error);
    },
});

// Create the database instance
export const database = new Database({
    adapter,
    modelClasses: [
        // Core
        Profile,
        Grimorio,
        Mision,
        // Library
        Subject,
        Book,
        StudySession,
        // Theatre
        TheatreActivity,
        TheatreMovie,
        TheatreSeries,
        TheatreSeason,
        // Barracks
        Exercise,
        UserExerciseFavorite,
        Routine,
        RoutineExercise,
        WorkoutSession,
        WorkoutSet,
        // Other Systems
        RoyalDecree,
        TemplePrayer,
        TavernQuest,
        MageTheme,
        DetectedApp,
        ComputerActivity,
        ActiveAuraChanneling,
        DisciplineProtocol,
    ],
});

export default database;
