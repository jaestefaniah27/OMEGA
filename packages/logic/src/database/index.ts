import 'react-native-get-random-values';
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';
import migrations from './migrations';
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

// Configure WatermelonDB to use UUID v4 for all record IDs
setGenerator(() => uuidv4());

const adapter = new LokiJSAdapter({
    schema,
    migrations,
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
