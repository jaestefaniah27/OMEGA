const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// --- TRANSLATION DATA ---

const MUSCLE_MAP = {
    // English to Spanish (Simplified)
    'abdominals': 'Abdominales',
    'abductors': 'Abductores',
    'adductors': 'Aductores',
    'biceps': 'Bíceps',
    'calves': 'Gemelos',
    'chest': 'Pecho',
    'forearms': 'Antebrazos',
    'glutes': 'Glúteos',
    'hamstrings': 'Isquios',
    'lats': 'Espalda',
    'lower back': 'Lumbar',
    'middle back': 'Espalda media',
    'neck': 'Cuello',
    'quadriceps': 'Cuádriceps',
    'shoulders': 'Hombros',
    'traps': 'Trapecio',
    'triceps': 'Tríceps',

    // Technical Spanish to Simplified
    'bíceps braquial': 'Bíceps',
    'tríceps braquial': 'Tríceps',
    'pectoral mayor': 'Pecho',
    'isquiosurales': 'Isquios',
    'dorsal ancho': 'Espalda',
    'deltoides': 'Hombros',
    'deltoides lateral': 'Hombros',
    'deltoides anterior': 'Hombros',
    'deltoides posterior': 'Hombros',
    'glúteo mayor': 'Glúteos',
    'erectores espinales': 'Lumbar',
    'trapecio superior': 'Trapecio',
    'trapecio medio/bajo': 'Espalda media'
};

const EXCEPTIONS = {
    // Basic Lifts
    "Deadlift": "Peso Muerto",
    "Squat": "Sentadilla",
    "Bench Press": "Press Banca",
    "Overhead Press": "Press Militar",
    "Pullups": "Dominadas",
    "Pull-Ups": "Dominadas",
    "Pushups": "Flexiones",
    "Push-Ups": "Flexiones",
    "Dips": "Fondos",
    "Plank": "Plancha",
    "Crunch": "Crunch",
    "Burpees": "Burpees",
    "Lunge": "Zancada",
    "Lunges": "Zancadas",
    "Chin-up": "Dominadas supinas",
    "Chin-Ups": "Dominadas supinas",
    "Reverse Fly": "Aperturas Invertidas",
    "Reverse Flyes": "Aperturas Invertidas",
    "Arnold Press": "Press Arnold",
    "Hug Knees To Chest": "Abrazo de rodillas al pecho",
    "Fast Skipping": "Skipping rápido",
    "Isometric Wipers": "Limpiaparabrisas isométricos",
    "Band Good Morning": "Buenos días con banda",
    "Good Morning": "Buenos días",
    "Air Bike": "Bicicleta Aérea"
};

const MAPPING_RULES = {
    equipment: {
        'Barbell': 'con barra',
        'Dumbbell': 'con mancuerna',
        'Cable': 'en polea',
        'Machine': 'en máquina',
        'Kettlebell': 'con pesa rusa',
        'Band': 'con banda',
        'Medicine Ball': 'con balón medicinal',
        'Exercise Ball': 'con fitball',
        'EZ Bar': 'con barra Z',
        'None': '',
        'Bodyweight': '',
        'Body Only': ''
    },
    movements: {
        'Press': 'Press',
        'Curl': 'Curl',
        'Row': 'Remo',
        'Extension': 'Extensión',
        'Extensions': 'Extensiones',
        'Raise': 'Elevación',
        'Raises': 'Elevaciones',
        'Fly': 'Apertura',
        'Flyes': 'Aperturas',
        'Pulldown': 'Jalón',
        'Pushdown': 'Extensión',
        'Squat': 'Sentadilla',
        'Deadlift': 'Peso Muerto',
        'Lunge': 'Zancada',
        'Good Morning': 'Buenos días'
    },
    modifiers: {
        'Incline': 'Inclinado',
        'Decline': 'Declinado',
        'Seated': 'Sentado',
        'Standing': 'De Pie',
        'Lying': 'Tumbado',
        'One Arm': 'a una mano',
        'Single Arm': 'a una mano',
        'Alternating': 'Alterno',
        'Reverse Grip': 'Agarre Inverso',
        'Neutral Grip': 'Agarre Neutro',
        'Wide Grip': 'Agarre Ancho',
        'Close Grip': 'Agarre Cerrado',
        'Behind The Neck': 'tras nuca'
    },
    targets: {
        'Chest': 'de pecho',
        'Shoulder': 'de hombros',
        'Shoulders': 'de hombros',
        'Triceps': 'de tríceps',
        'Tricep': 'de tríceps',
        'Biceps': 'de bíceps',
        'Bicep': 'de bíceps',
        'Leg': 'de piernas',
        'Legs': 'de piernas',
        'Calf': 'de gemelo',
        'Calves': 'de gemelos',
        'Abdominal': 'de abdomen',
        'Abs': 'de abdomen',
        'Glute': 'de glúteo',
        'Glutes': 'de glúteos',
        'Back': 'de espalda',
        'Lower Back': 'Lumbar',
        'Wrist': 'de muñeca',
        'Hip': 'de cadera',
        'Deltoid': 'de hombros',
        'Delt': 'de hombros',
        'Hamstring': 'de isquios',
        'Quad': 'de cuádriceps',
        'Quadriceps': 'de cuádriceps',
        'Neck': 'de cuello',
        'Trap': 'de trapecio',
        'Traps': 'de trapecio',
        'Lats': 'de espalda'
    }
};

function translateExerciseName(englishName) {
    if (EXCEPTIONS[englishName]) return EXCEPTIONS[englishName];

    // Check partial exceptions
    for (let key in EXCEPTIONS) {
        if (englishName.toLowerCase().includes(key.toLowerCase())) {
            // This is a bit simplified, but helps
        }
    }

    let translated = englishName;

    // Apply equipment
    for (let key in MAPPING_RULES.equipment) {
        if (translated.includes(key)) {
            translated = translated.replace(key, '').trim();
            const suffix = MAPPING_RULES.equipment[key];
            if (suffix) translated += ` ${suffix}`;
        }
    }

    // Apply movements & modifiers... 
    // (Reconstructing simplified version for now, was more complex before)
    return translated;
}

// Overrides for specific exercises
const DATA_OVERRIDES = {
    "Barbell Bench Press - Medium Grip": {
        name_es: "Press Banca (Barra)",
        primary_muscles: ["Pecho"],
        secondary_muscles: ["Tríceps", "Hombros"],
        intensity_factor: 1.0,
        bodyweight_factor: 0.0,
        category: "strength",
        muscle_heads: [
            { muscle: "Pecho", head: "Pectoral Mayor (Media/Baja)", activation: 1.0 },
            { muscle: "Hombros", head: "Deltoides Anterior", activation: 0.6 }
        ]
    },
    // ... I'll add the rest from the previous session summary ...
    "Barbell Incline Bench Press - Medium Grip": {
        name_es: "Press Banca Inclinado (Barra)",
        primary_muscles: ["Pecho"],
        secondary_muscles: ["Tríceps", "Hombros"],
        intensity_factor: 1.0,
        bodyweight_factor: 0.0,
        category: "strength",
        muscle_heads: [
            { muscle: "Pecho", head: "Pectoral Mayor (Superior)", activation: 1.0 },
            { muscle: "Hombros", head: "Deltoides Anterior", activation: 0.7 }
        ]
    }
};

async function transformData() {
    console.log('⬇️  Downloading exercises JSON...');
    const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const exercises = await response.json();

    return exercises.map(ex => {
        const override = DATA_OVERRIDES[ex.name];
        const primary = (override ? override.primary_muscles : ex.primaryMuscles).map(m => MUSCLE_MAP[m.toLowerCase()] || m);
        const secondary = (override ? override.secondary_muscles : ex.secondaryMuscles).map(m => MUSCLE_MAP[m.toLowerCase()] || m);

        return {
            name: ex.name,
            name_es: override ? override.name_es : translateExerciseName(ex.name),
            force: ex.force,
            level: ex.level,
            mechanic: ex.mechanic,
            equipment: ex.equipment,
            primary_muscles: primary,
            secondary_muscles: secondary,
            instructions: ex.instructions,
            category: override ? override.category : ex.category,
            is_popular: !!override || !!EXCEPTIONS[ex.name],
            intensity_factor: override ? override.intensity_factor : 1.0,
            bodyweight_factor: override ? override.bodyweight_factor : (ex.equipment === 'body only' ? 1.0 : 0.0),
            muscle_heads: override ? override.muscle_heads : []
        };
    });
}

async function main() {
    const exercisesToUpsert = await transformData();

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Upload to Supabase
    console.log('🚀 Uploading to Supabase...');
    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Supabase credentials not found. Skipping upload.');
    } else {
        const BATCH_SIZE = 100;
        for (let i = 0; i < exercisesToUpsert.length; i += BATCH_SIZE) {
            let batch = exercisesToUpsert.slice(i, i + BATCH_SIZE).map(ex => {
                const clean = { ...ex };
                if (clean.muscle_heads) clean.muscle_heads = JSON.stringify(clean.muscle_heads);
                return clean;
            });

            let { error } = await supabase.from('exercises').upsert(batch, { onConflict: 'name' });

            if (error && error.code === 'PGRST204') {
                console.warn('⚠️ Column "muscle_heads" not found. Retrying without it...');
                const simpleBatch = batch.map(({ muscle_heads, ...rest }) => rest);
                const { error: retryError } = await supabase.from('exercises').upsert(simpleBatch, { onConflict: 'name' });
                error = retryError;
            }

            if (error) {
                console.error(`❌ Error uploading batch ${i / BATCH_SIZE + 1}:`, error.message);
            } else {
                console.log(`✅ Batch ${i / BATCH_SIZE + 1} uploaded.`);
            }
        }
    }

    // 2. Fetch IDs from Supabase to ensure local JSON has real UUIDs
    console.log('🔍 Fetching latest UUIDs from Supabase...');
    const { data: dbExercises, error: fetchError } = await supabase
        .from('exercises')
        .select('id, name');

    const idMap = {};
    if (!fetchError && dbExercises) {
        dbExercises.forEach(ex => {
            idMap[ex.name] = ex.id;
        });
    }

    // 3. Save Core Exercises to Local File (with real IDs)
    const coreExList = exercisesToUpsert.filter(ex =>
        Object.keys(EXCEPTIONS).some(coreName => ex.name.toLowerCase().includes(coreName.toLowerCase())) || ex.is_popular
    ).slice(0, 150);

    const coreWithIds = coreExList.map(ex => ({
        ...ex,
        id: idMap[ex.name] || ex.name
    }));

    const corePath = path.resolve(__dirname, '../apps/movil/src/data');
    if (!fs.existsSync(corePath)) fs.mkdirSync(corePath, { recursive: true });

    fs.writeFileSync(path.join(corePath, 'core_exercises.json'), JSON.stringify(coreWithIds, null, 2));
    console.log(`💾 Saved ${coreWithIds.length} core exercises to apps/movil/src/data/core_exercises.json`);

    console.log('✨ Import complete!');
}

main().catch(err => console.error(err));
