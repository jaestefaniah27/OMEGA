import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import {
    Profile,
    UserStats,
    Subject,
    Book,
    StudySession,
    Routine,
    RoutineExercise,
    Exercise,
    WorkoutSession,
    WorkoutSet,
    TheatreActivity,
    TheatreMovie,
    TheatreSeries,
    TheatreSeason,
    TempleThought,
    TempleSleep,
    TavernWater,
    MageTheme,
    MageProject,
    RoyalDecree,
    DailyRitual,
    RitualLog,
    CustomColor,
    AppAuraMapping
} from './models';

const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: false,
    dbName: 'omega_db',
    onQuotaExceededError: (error) => {
        console.error('LokiJS Persistence Quota Exceeded:', error);
    },
});

export const database = new Database({
    adapter,
    modelClasses: [
        Profile,
        UserStats,
        Subject,
        Book,
        StudySession,
        Routine,
        RoutineExercise,
        Exercise,
        WorkoutSession,
        WorkoutSet,
        TheatreActivity,
        TheatreMovie,
        TheatreSeries,
        TheatreSeason,
        TempleThought,
        TempleSleep,
        TavernWater,
        MageTheme,
        MageProject,
        RoyalDecree,
        DailyRitual,
        RitualLog,
        CustomColor,
        AppAuraMapping
    ],
});
