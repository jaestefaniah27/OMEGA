const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// --- PASTE CURRENT LOGIC FROM import_exercises.js HERE (SIMULATED FOR AUDIT) ---
// I will copy the logic exactly as it is in the current import_exercises.js file
// to ensure the audit matches reality.

const MUSCLE_MAP = {
    'abdominals': 'Abdominales',
    'abductors': 'Abductores',
    'adductors': 'Aductores',
    'biceps': 'Bíceps',
    'calves': 'Gemelos',
    'chest': 'Pecho',
    'forearms': 'Antebrazos',
    'glutes': 'Glúteos',
    'hamstrings': 'Isquios',
    'lats': 'Dorsales',
    'lower back': 'Lumbar',
    'middle back': 'Espalda Media',
    'neck': 'Cuello',
    'quadriceps': 'Cuádriceps',
    'shoulders': 'Hombros',
    'traps': 'Trapecios',
    'triceps': 'Tríceps'
};

const EXCEPTIONS = {
    // Basic Lifts
    "Deadlift": "Peso Muerto",
    "Squat": "Sentadilla",
    "Bench Press": "Press de Banca",
    "Overhead Press": "Press Militar",
    "Pullups": "Dominadas",
    "Dips": "Fondos",
    "Pushups": "Flexiones",
    "Plank": "Plancha",
    "Lunges": "Zancadas",

    // Olympic / Power
    "Clean and Jerk": "Cargada y Envión",
    "Snatch": "Arrancada",
    "Power Clean": "Cargada de Potencia",
    "Hang Clean": "Cargada Colgante",
    "Power Snatch": "Arrancada de Potencia",
    "Hang Snatch": "Arrancada Colgante",
    "Muscle Snatch": "Muscle Snatch",
    "Muscle Clean": "Muscle Clean",

    // Calisthenics / Plyo
    "Burpees": "Burpees",
    "Jumping Jacks": "Jumping Jacks",
    "Mountain Climbers": "Escaladores",
    "Box Jumps": "Saltos al Cajón",
    "Knee Tuck Jump": "Salto con rodillas al pecho",
    "Muscle-up": "Muscle-up",
    "Handstand Pushup": "Flexión Pineado",

    // Specific Named Exercises
    "Arnold Press": "Press Arnold",
    "Svend Press": "Press Svend",
    "Pallof Press": "Press Pallof",
    "Zottman Curl": "Curl Zottman",
    "Jefferson Curl": "Curl Jefferson",
    "Zercher Squat": "Sentadilla Zercher",
    "Good Morning": "Buenos Días",
    "Romanian Deadlift": "Peso Muerto Rumano",
    "Sumo Deadlift": "Peso Muerto Sumo",
    "Stiff Leg Deadlift": "Peso Muerto Piernas Rígidas",
    "Front Squat": "Sentadilla Frontal",
    "Goblet Squat": "Sentadilla Goblet",
    "Pistol Squat": "Sentadilla Pistol",
    "Bulgarian Split Squat": "Sentadilla Búlgara",
    "Hack Squat": "Sentadilla Hack",
    "Seated Barbell Military Press": "Press Militar sentado con barra",

    // Common Variations
    "Preacher Curl": "Curl Predicador",
    "Hammer Curl": "Curl Martillo",
    "Skullcrusher": "Press Francés",
    "Face Pull": "Face Pull",
    "Hip Thrust": "Hip Thrust",
    "Glute Bridge": "Puente de Glúteo",
    "Calf Raises": "Elevación de Talones",
    "Leg Press": "Prensa",
    "Farmer's Walk": "Paseo del Granjero",
    "Kettlebell Swing": "Balanceo con Pesa Rusa",
    "Russian Twist": "Giros Rusos",
    "Leg Extension": "Extensión de Cuádriceps",
    "Leg Curl": "Curl Femoral",
    "Lat Pulldown": "Jalón al Pecho",
    "Cable Crossover": "Cruce de Poleas",
    "Pec Deck": "Contractora",
    "Reverse Fly": "Pájaros",
    "T-Bar Row": "Remo Punta",
    "Chin-up": "Dominada Supina",
    "Pull-up": "Dominada Prona",
    "Sit-up": "Abdominales",
    "Ab Roller": "Rueda Abdominal"
};

const MAPPING_RULES = {
    movements: {
        'Press': 'Press',
        'Curl': 'Curl',
        'Extension': 'Extensión',
        'Raise': 'Elevación',
        'Row': 'Remo',
        'Fly': 'Aperturas',
        'Pull': 'Jalón',
        'Push': 'Empuje',
        'Squat': 'Sentadilla',
        'Lunge': 'Zancada',
        'Deadlift': 'Peso Muerto',
        'Crunch': 'Crunch',
        'Twist': 'Giro',
        'Walk': 'Caminata',
        'Swing': 'Balanceo',
        'Hold': 'Isométrico',
        'Carry': 'Transporte',
        'Kick': 'Patada',
        'Thrust': 'Empuje',
        'Jump': 'Salto',
        'Shrug': 'Encogimiento'
    },
    modifiers: {
        'Military': 'Militar',
        'Incline': 'Inclinado',
        'Decline': 'Declinado',
        'Behind the Neck': 'Trasnuca',
        'Close Grip': 'Agarre Cerrado',
        'Wide Grip': 'Agarre Ancho',
        'Reverse Grip': 'Agarre Inverso',
        'Neutral Grip': 'Agarre Neutro',
        'Single Arm': 'a una mano',
        'One Arm': 'a una mano',
        'Single Leg': 'a una pierna',
        'High': 'Alto',
        'Low': 'Bajo',
        'Side': 'Lateral',
        'Front': 'Frontal',
        'Rear': 'Posterior',
        'Seated': 'Sentado',
        'Standing': 'De Pie',
        'Lying': 'Tumbado',
        'Bent Over': 'Inclinado',
        'Concentration': 'Concentrado',
        'Strict': 'Estricto'
    },
    equipment: {
        'Dumbbell': 'con mancuerna',
        'Barbell': 'con barra',
        'Kettlebell': 'con pesa rusa',
        'Cable': 'en polea',
        'Machine': 'en máquina',
        'Smith': 'en multipower',
        'Band': 'con banda',
        'Weighted': 'con lastre',
        'Bodyweight': '',
        'Plate': 'con disco',
        'Medicine Ball': 'con balón medicinal',
        'TRX': 'en TRX',
        'Swiss Ball': 'con pelota suiza'
    },
    targets: {
        'Chest': 'de pecho',
        'Shoulder': 'de hombros',
        'Triceps': 'de tríceps',
        'Biceps': 'de bíceps',
        'Leg': 'de piernas',
        'Calf': 'de gemelo',
        'Abdominal': 'de abdomen',
        'Glute': 'de glúteo',
        'Back': 'de espalda',
        'Wrist': 'de muñeca',
        'Hip': 'de cadera',
        'Deltoid': 'de deltoides'
    }
};

function translateExerciseName(englishName) {
    if (EXCEPTIONS[englishName]) return EXCEPTIONS[englishName];
    for (const [key, value] of Object.entries(EXCEPTIONS)) {
        if (englishName.toLowerCase() === key.toLowerCase()) return value;
    }

    let remaining = englishName;
    let components = { move: '', target: '', modifier: [], equipment: '' };

    const extract = (map, type) => {
        const keys = Object.keys(map).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            const regex = new RegExp(`\\b${key}\\b`, 'i');
            if (regex.test(remaining)) {
                if (type === 'modifier') {
                    components.modifier.push(map[key]);
                } else {
                    if (!components[type]) components[type] = map[key];
                }
                remaining = remaining.replace(regex, '').trim();
            }
        }
    };

    extract(MAPPING_RULES.movements, 'move');
    extract(MAPPING_RULES.targets, 'target');
    extract(MAPPING_RULES.equipment, 'equipment');
    extract(MAPPING_RULES.modifiers, 'modifier');

    if (!components.move) {
        let simplified = englishName;
        [MAPPING_RULES.movements, MAPPING_RULES.modifiers, MAPPING_RULES.targets, MAPPING_RULES.equipment].forEach(map => {
            Object.keys(map).forEach(key => {
                simplified = simplified.replace(new RegExp(`\\b${key}\\b`, 'gi'), map[key]);
            });
        });
        return simplified;
    }

    let parts = [components.move];
    if (components.target) parts.push(components.target);
    if (components.modifier.length > 0) parts.push(components.modifier.join(' '));
    if (components.equipment) parts.push(components.equipment);

    return parts.join(' ').replace(/\s+/g, ' ').trim();
}

async function main() {
    try {
        const response = await fetch(SOURCE_URL);
        const rawExercises = await response.json();
        const lines = rawExercises.map(ex => {
            const translated = translateExerciseName(ex.name);
            return `${ex.name} -> ${translated}`;
        });

        fs.writeFileSync('translation_audit.txt', lines.join('\n'));
        console.log(`Audit saved to translation_audit.txt with ${lines.length} items.`);
    } catch (e) {
        console.error(e);
    }
}

main();
