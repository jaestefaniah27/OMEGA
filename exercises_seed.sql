INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    '3/4 Sit-Up',
    '3/4 Sit-Up',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    '90/90 Hamstring',
    '90/90 de isquios',
    ARRAY['Isquios'],
    ARRAY['Gemelos'],
    'push',
    'beginner',
    '',
    'body only',
    'stretching',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Air Bike',
    'Bicicleta Aérea',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'All Fours Quad Stretch',
    'Estiramiento de cuádriceps',
    ARRAY['Cuádriceps'],
    ARRAY['Cuádriceps'],
    'static',
    'intermediate',
    '',
    'body only',
    'stretching',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Alternate Hammer Curl',
    'Curl Alterno',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Alternate Heel Touchers',
    'Alterno Heel Touchers',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Alternate Incline Dumbbell Curl',
    'Curl Alterno Inclinado con mancuerna',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Alternating Cable Shoulder Press',
    'Press de hombros Alterno en polea',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Alternating Deltoid Raise',
    'Elevación de hombros Alterno',
    ARRAY['Hombros'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Anti-Gravity Press',
    'Press',
    ARRAY['Hombros'],
    ARRAY['Espalda media','Trapecio','Tríceps'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Arnold Dumbbell Press',
    'Press Arnold',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Around The Worlds',
    'Around The Worlds',
    ARRAY['Pecho'],
    ARRAY['Hombros'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Ab Rollout',
    'Deslizamiento con barra',
    ARRAY['Abdominales'],
    ARRAY['Lumbar','Hombros'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Ab Rollout - On Knees',
    'Deslizamiento con barra',
    ARRAY['Abdominales'],
    ARRAY['Lumbar','Hombros'],
    'pull',
    'expert',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Bench Press - Medium Grip',
    'Press Banca (Barra)',
    ARRAY['Pecho'],
    ARRAY['Tríceps','Hombros'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    true,
    '[{"muscle":"Pecho","head":"Pectoral Mayor (Media/Baja)","activation":1},{"muscle":"Hombros","head":"Deltoides Anterior","activation":0.6}]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Curl',
    'Curl con barra',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Curls Lying Against An Incline',
    'con barra Curls Tumbado Against An Inclinado',
    ARRAY['Bíceps'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Deadlift',
    'Peso Muerto con barra',
    ARRAY['Lumbar'],
    ARRAY['Gemelos','Antebrazos','Glúteos','Isquios','Espalda','Espalda media','Cuádriceps','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Full Squat',
    'Sentadilla con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Glute Bridge',
    'Puente de glúteo con barra',
    ARRAY['Glúteos'],
    ARRAY['Gemelos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Guillotine Bench Press',
    'Press con barra',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Hack Squat',
    'Sentadilla con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Antebrazos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Hip Thrust',
    'Empuje de cadera con barra',
    ARRAY['Glúteos'],
    ARRAY['Gemelos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Incline Bench Press - Medium Grip',
    'Press Banca Inclinado (Barra)',
    ARRAY['Pecho'],
    ARRAY['Tríceps','Hombros'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    true,
    '[{"muscle":"Pecho","head":"Pectoral Mayor (Superior)","activation":1},{"muscle":"Hombros","head":"Deltoides Anterior","activation":0.7}]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Incline Shoulder Raise',
    'Elevación de hombros Inclinado con barra',
    ARRAY['Hombros'],
    ARRAY['Pecho'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Lunge',
    'Zancada con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Rear Delt Row',
    'Remo de hombros Posterior con barra',
    ARRAY['Hombros'],
    ARRAY['Bíceps','Espalda','Espalda media'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Rollout from Bench',
    'Deslizamiento con barra',
    ARRAY['Abdominales'],
    ARRAY['Glúteos','Isquios','Espalda','Hombros'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Seated Calf Raise',
    'Elevación de gemelo Sentado con barra',
    ARRAY['Gemelos'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Shoulder Press',
    'Press de hombros con barra',
    ARRAY['Hombros'],
    ARRAY['Pecho','Tríceps'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Shrug',
    'Encogimiento con barra',
    ARRAY['Trapecio'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Shrug Behind The Back',
    'Encogimiento de espalda con barra',
    ARRAY['Trapecio'],
    ARRAY['Antebrazos','Espalda media'],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Side Bend',
    'con barra Lateral Bend',
    ARRAY['Abdominales'],
    ARRAY['Lumbar'],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Side Split Squat',
    'Sentadilla Lateral con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Isquios','Lumbar'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Squat',
    'Sentadilla con barra',
    ARRAY['Cuádriceps','Glúteos'],
    ARRAY['Isquios','Lumbar'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    true,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Squat To A Bench',
    'Sentadilla con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'expert',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Step Ups',
    'con barra Step Ups',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Cuádriceps'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Barbell Walking Lunge',
    'Zancada con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bench Dips',
    'Fondos',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bench Jump',
    'Salto',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'body only',
    'plyometrics',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bench Press - Powerlifting',
    'Press',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Antebrazos','Espalda','Hombros'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bench Press with Chains',
    'Press',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Espalda','Hombros'],
    'push',
    'expert',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent-Arm Barbell Pullover',
    'Bent-Arm con barra Pullover',
    ARRAY['Espalda'],
    ARRAY['Pecho','Espalda','Hombros','Tríceps'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent-Arm Dumbbell Pullover',
    'Bent-Arm con mancuerna Pullover',
    ARRAY['Pecho'],
    ARRAY['Espalda','Hombros','Tríceps'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent-Knee Hip Raise',
    'Elevación de cadera',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Barbell Row',
    'Remo con barra',
    ARRAY['Espalda'],
    ARRAY['Bíceps','Isquios'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    true,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Dumbbell Rear Delt Raise With Head On Bench',
    'Elevación de hombros Inclinado Posterior con mancuerna',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Low-Pulley Side Lateral',
    'Inclinado Bajo-Pulley Lateral Lateral',
    ARRAY['Hombros'],
    ARRAY['Lumbar','Espalda media','Trapecio'],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over One-Arm Long Bar Row',
    'Remo Inclinado a una mano',
    ARRAY['Espalda media'],
    ARRAY['Bíceps','Espalda','Lumbar','Trapecio'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Two-Arm Long Bar Row',
    'Remo Inclinado',
    ARRAY['Espalda media'],
    ARRAY['Bíceps','Espalda'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Two-Dumbbell Row',
    'Remo Inclinado con mancuerna',
    ARRAY['Espalda media'],
    ARRAY['Bíceps','Espalda','Hombros'],
    'pull',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bent Over Two-Dumbbell Row With Palms In',
    'Remo Inclinado con mancuerna',
    ARRAY['Espalda media'],
    ARRAY['Bíceps','Espalda'],
    'pull',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Board Press',
    'Press',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Antebrazos','Espalda','Hombros'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Body-Up',
    'Body-Up',
    ARRAY['Tríceps'],
    ARRAY['Abdominales','Antebrazos'],
    'push',
    'intermediate',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Body Tricep Press',
    'Press de tríceps',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bodyweight Squat',
    'Sentadilla',
    ARRAY['Cuádriceps'],
    ARRAY['Glúteos','Isquios'],
    'push',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bosu Ball Cable Crunch With Side Bends',
    'Crunch Lateral en polea',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bottoms Up',
    'Bottoms Up',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Box Squat',
    'Sentadilla',
    ARRAY['Cuádriceps'],
    ARRAY['Aductores','Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Box Squat with Bands',
    'Sentadilla con bandas',
    ARRAY['Cuádriceps'],
    ARRAY['Abductores','Aductores','Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'expert',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Box Squat with Chains',
    'Sentadilla',
    ARRAY['Cuádriceps'],
    ARRAY['Abductores','Aductores','Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'expert',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Bradford/Rocky Presses',
    'Press Bradford',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Butt-Ups',
    'Butt-Ups',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Butt Lift (Bridge)',
    'Puente',
    ARRAY['Glúteos'],
    ARRAY['Isquios'],
    'push',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Chest Press',
    'Press de pecho en polea',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Crossover',
    'Cruce de Poleas',
    ARRAY['Pecho'],
    ARRAY['Hombros'],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Crunch',
    'Crunch en polea',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Deadlifts',
    'en polea Deadlifts',
    ARRAY['Cuádriceps'],
    ARRAY['Antebrazos','Glúteos','Isquios','Lumbar'],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Hammer Curls - Rope Attachment',
    'en polea Hammer Curls - con cuerda Attachment',
    ARRAY['Bíceps'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Hip Adduction',
    'en polea de cadera Adduction',
    ARRAY['Cuádriceps'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Incline Pushdown',
    'Extensión Inclinado en polea',
    ARRAY['Espalda'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Incline Triceps Extension',
    'Extensión de tríceps Inclinado en polea',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Internal Rotation',
    'Rotación en polea',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Iron Cross',
    'en polea Iron Cross',
    ARRAY['Pecho'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Judo Flip',
    'en polea Judo Flip',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Lying Triceps Extension',
    'Extensión de tríceps Tumbado en polea',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable One Arm Tricep Extension',
    'Extensión de tríceps a una mano en polea',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Preacher Curl',
    'Curl en polea',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Rear Delt Fly',
    'Aperturas de hombros Posterior en polea',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Reverse Crunch',
    'Crunch en polea',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Rope Overhead Triceps Extension',
    'Extensión de tríceps en polea',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Rope Rear-Delt Rows',
    'en polea con cuerda Posterior-de hombros Rows',
    ARRAY['Hombros'],
    ARRAY['Bíceps','Espalda media'],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Russian Twists',
    'en polea Russian Twists',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Seated Crunch',
    'Crunch Sentado en polea',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Seated Lateral Raise',
    'Elevación Sentado en polea',
    ARRAY['Hombros'],
    ARRAY['Espalda media','Trapecio'],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Shoulder Press',
    'Press de hombros en polea',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Shrugs',
    'Encogimientos en polea',
    ARRAY['Trapecio'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cable Wrist Curl',
    'Curl de muñeca en polea',
    ARRAY['Antebrazos'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Calf Raise On A Dumbbell',
    'Elevación de gemelo con mancuerna',
    ARRAY['Gemelos'],
    ARRAY[''],
    'push',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Car Drivers',
    'Car Drivers',
    ARRAY['Hombros'],
    ARRAY['Antebrazos'],
    'push',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Chin-Up',
    'Dominada Supina',
    ARRAY['Espalda'],
    ARRAY['Bíceps','Antebrazos','Espalda media'],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean',
    'Cargada',
    ARRAY['Isquios'],
    ARRAY['Gemelos','Antebrazos','Glúteos','Lumbar','Cuádriceps','Hombros','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean Deadlift',
    'Peso Muerto',
    ARRAY['Isquios'],
    ARRAY['Antebrazos','Glúteos','Lumbar','Espalda media','Cuádriceps','Trapecio'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean Pull',
    'Jalón',
    ARRAY['Cuádriceps'],
    ARRAY['Antebrazos','Glúteos','Isquios','Lumbar','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean Shrug',
    'Encogimiento',
    ARRAY['Trapecio'],
    ARRAY['Antebrazos','Hombros'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean and Jerk',
    'Cargada y Envión',
    ARRAY['Hombros'],
    ARRAY['Abdominales','Glúteos','Isquios','Lumbar','Cuádriceps','Trapecio','Tríceps'],
    'push',
    'expert',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean and Press',
    'Cargada y Press',
    ARRAY['Hombros'],
    ARRAY['Abdominales','Gemelos','Glúteos','Isquios','Lumbar','Espalda media','Cuádriceps','Hombros','Trapecio','Tríceps'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clean from Blocks',
    'Clean from Blocks',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Hombros','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Clock Push-Up',
    'Empuje',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'intermediate',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip Barbell Bench Press',
    'Press Agarre Cerrado con barra',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip Dumbbell Press',
    'Press Agarre Cerrado con mancuerna',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip EZ Bar Curl',
    'Curl Agarre Cerrado con barra Z',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip Front Lat Pulldown',
    'Jalón Agarre Cerrado Frontal',
    ARRAY['Espalda'],
    ARRAY['Bíceps','Espalda media','Hombros'],
    'pull',
    'beginner',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip Push-Up off of a Dumbbell',
    'Empuje Agarre Cerrado con mancuerna',
    ARRAY['Tríceps'],
    ARRAY['Abdominales','Pecho','Hombros'],
    'push',
    'intermediate',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Close-Grip Standing Barbell Curl',
    'Curl Agarre Cerrado De Pie con barra',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cocoons',
    'Capullos (Abdominales)',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Concentration Curls',
    'Concentrado Curls',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cross-Body Crunch',
    'Crunch',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cross Body Hammer Curl',
    'Curl Cruzado',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Crunch - Hands Overhead',
    'Crunch',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Crunch - Legs On Exercise Ball',
    'Crunch de piernas con pelota suiza',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Crunches',
    'Crunches',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Cuban Press',
    'Press',
    ARRAY['Hombros'],
    ARRAY['Trapecio'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dead Bug',
    'Bicho Muerto',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Deadlift with Bands',
    'Peso Muerto con bandas',
    ARRAY['Lumbar'],
    ARRAY['Antebrazos','Glúteos','Isquios','Espalda media','Cuádriceps','Trapecio'],
    'pull',
    'expert',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Deadlift with Chains',
    'Peso Muerto',
    ARRAY['Lumbar'],
    ARRAY['Antebrazos','Glúteos','Isquios','Espalda media','Cuádriceps','Trapecio'],
    'pull',
    'expert',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Barbell Bench Press',
    'Press Declinado con barra',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Close-Grip Bench To Skull Crusher',
    'Declinado Agarre Cerrado Bench To Skull Crusher',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Crunch',
    'Crunch Declinado',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Dumbbell Bench Press',
    'Press Declinado con mancuerna',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Dumbbell Flyes',
    'Aperturas Declinado con mancuerna',
    ARRAY['Pecho'],
    ARRAY[''],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Dumbbell Triceps Extension',
    'Extensión de tríceps Declinado con mancuerna',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline EZ Bar Triceps Extension',
    'Extensión de tríceps Declinado con barra Z',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Oblique Crunch',
    'Crunch Declinado',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Decline Reverse Crunch',
    'Crunch Declinado',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Deficit Deadlift',
    'Peso Muerto',
    ARRAY['Lumbar'],
    ARRAY['Antebrazos','Glúteos','Isquios','Espalda media','Cuádriceps','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dips - Triceps Version',
    'Fondos de tríceps',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Double Leg Butt Kick',
    'Patada de piernas Doble',
    ARRAY['Cuádriceps'],
    ARRAY['Abductores','Aductores','Gemelos','Glúteos','Isquios'],
    'push',
    'beginner',
    'compound',
    'body only',
    'plyometrics',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Drag Curl',
    'Curl',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Alternate Bicep Curl',
    'Curl de bíceps Alterno con mancuerna',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Bench Press',
    'Press con mancuerna plano',
    ARRAY['Pecho'],
    ARRAY['Tríceps','Hombros'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    true,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Bench Press with Neutral Grip',
    'Press Agarre Neutro con mancuerna',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Bicep Curl',
    'Curl de bíceps con mancuerna',
    ARRAY['Bíceps'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Clean',
    'con mancuerna Clean',
    ARRAY['Isquios'],
    ARRAY['Gemelos','Antebrazos','Glúteos','Lumbar','Cuádriceps','Hombros','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Floor Press',
    'Press con mancuerna',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Flyes',
    'Aperturas con mancuernas',
    ARRAY['Pecho'],
    ARRAY['Hombros'],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    true,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Incline Row',
    'Remo Inclinado con mancuerna',
    ARRAY['Espalda media'],
    ARRAY['Bíceps','Antebrazos','Espalda','Hombros'],
    'pull',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Incline Shoulder Raise',
    'Elevación de hombros Inclinado con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Lunges',
    'Zancadas con mancuerna',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Lying One-Arm Rear Lateral Raise',
    'Elevación a una mano Tumbado Posterior con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Espalda media'],
    'pull',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Lying Pronation',
    'con mancuerna Tumbado Pronation',
    ARRAY['Antebrazos'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Lying Rear Lateral Raise',
    'Elevación Tumbado Posterior con mancuerna',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Lying Supination',
    'con mancuerna Tumbado Supination',
    ARRAY['Antebrazos'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell One-Arm Shoulder Press',
    'Press de hombros a una mano con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell One-Arm Triceps Extension',
    'Extensión de tríceps a una mano con mancuerna',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell One-Arm Upright Row',
    'Remo a una mano con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Bíceps','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Prone Incline Curl',
    'Curl Inclinado con mancuerna',
    ARRAY['Bíceps'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Raise',
    'Elevación con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Bíceps'],
    'pull',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Rear Lunge',
    'Zancada Posterior con mancuerna',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Scaption',
    'con mancuerna Scaption',
    ARRAY['Hombros'],
    ARRAY['Trapecio'],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Seated Box Jump',
    'Salto Sentado con mancuerna',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'plyometrics',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Seated One-Leg Calf Raise',
    'Elevación de gemelo Sentado con mancuerna',
    ARRAY['Gemelos'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Shoulder Press',
    'Press de hombros con mancuerna',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Shrug',
    'Encogimiento con mancuerna',
    ARRAY['Trapecio'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Side Bend',
    'con mancuerna Lateral Bend',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Squat',
    'Sentadilla con mancuerna',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Squat To A Bench',
    'Sentadilla con mancuerna',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Step Ups',
    'con mancuerna Step Ups',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Dumbbell Tricep Extension -Pronated Grip',
    'Extensión de tríceps con mancuerna',
    ARRAY['Tríceps'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Elbow to Knee',
    'Elbow to Knee',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Elevated Back Lunge',
    'Zancada de espalda',
    ARRAY['Cuádriceps'],
    ARRAY['Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Elevated Cable Rows',
    'Elevated en polea Rows',
    ARRAY['Espalda'],
    ARRAY['Espalda media','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'External Rotation',
    'Rotación',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'External Rotation with Cable',
    'Rotación en polea',
    ARRAY['Hombros'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Face Pull',
    'Face Pull',
    ARRAY['Hombros'],
    ARRAY['Espalda media'],
    'pull',
    'intermediate',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Fast Skipping',
    'Skipping Rápido',
    ARRAY['Cuádriceps'],
    ARRAY['Abductores','Aductores','Gemelos','Glúteos','Isquios'],
    'push',
    'beginner',
    'compound',
    'body only',
    'plyometrics',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Finger Curls',
    'Finger Curls',
    ARRAY['Antebrazos'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'barbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Flat Bench Cable Flyes',
    'Aperturas en polea',
    ARRAY['Pecho'],
    ARRAY[''],
    'push',
    'intermediate',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Flat Bench Leg Pull-In',
    'Encogimiento de piernas',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Flat Bench Lying Leg Raise',
    'Elevación de piernas Tumbado',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Flexor Incline Dumbbell Curls',
    'Flexor Inclinado con mancuerna Curls',
    ARRAY['Bíceps'],
    ARRAY[''],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Floor Press',
    'Press',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Floor Press with Chains',
    'Press',
    ARRAY['Tríceps'],
    ARRAY['Pecho','Hombros'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Flutter Kicks',
    'Flutter Kicks',
    ARRAY['Glúteos'],
    ARRAY['Isquios'],
    'pull',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Frankenstein Squat',
    'Sentadilla Frankenstein',
    ARRAY['Cuádriceps'],
    ARRAY['Abdominales','Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Freehand Jump Squat',
    'Sentadilla',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Frog Sit-Ups',
    'Frog Sit-Ups',
    ARRAY['Abdominales'],
    ARRAY[''],
    'pull',
    'intermediate',
    'isolation',
    'body only',
    'strength',
    0.8,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Barbell Squat',
    'Sentadilla Frontal con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'expert',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Barbell Squat To A Bench',
    'Sentadilla Frontal con barra',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Glúteos','Isquios'],
    'push',
    'expert',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Cable Raise',
    'Elevación Frontal en polea',
    ARRAY['Hombros'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'cable',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Dumbbell Raise',
    'Elevación Frontal con mancuerna',
    ARRAY['Hombros'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Incline Dumbbell Raise',
    'Elevación Inclinado Frontal con mancuerna',
    ARRAY['Hombros'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Leg Raises',
    'Elevaciones de piernas Frontal',
    ARRAY['Isquios'],
    ARRAY[''],
    'pull',
    'beginner',
    '',
    'body only',
    'stretching',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Raise And Pullover',
    'Elevación Frontal',
    ARRAY['Pecho'],
    ARRAY['Espalda','Hombros','Tríceps'],
    'pull',
    'beginner',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Squat (Clean Grip)',
    'Sentadilla Frontal',
    ARRAY['Cuádriceps'],
    ARRAY['Abdominales','Glúteos','Isquios'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Front Two-Dumbbell Raise',
    'Elevación Frontal con mancuerna',
    ARRAY['Hombros'],
    ARRAY[''],
    'push',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Full Range-Of-Motion Lat Pulldown',
    'Jalón',
    ARRAY['Espalda'],
    ARRAY['Bíceps','Espalda media','Hombros'],
    'pull',
    'intermediate',
    'compound',
    'cable',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Glute Kickback',
    'de glúteo Kickback',
    ARRAY['Glúteos'],
    ARRAY['Isquios'],
    'push',
    'beginner',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Good Morning',
    'Buenos Días',
    ARRAY['Isquios'],
    ARRAY['Abdominales','Glúteos','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Good Morning off Pins',
    'Buenos Días desde soportes',
    ARRAY['Isquios'],
    ARRAY['Abdominales','Glúteos','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Gorilla Chin/Crunch',
    'Crunch',
    ARRAY['Abdominales'],
    ARRAY['Bíceps','Espalda'],
    'pull',
    'intermediate',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Groiners',
    'Groiners',
    ARRAY['Aductores'],
    ARRAY[''],
    'pull',
    'intermediate',
    'compound',
    'body only',
    'stretching',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hammer Curls',
    'Curl martillo',
    ARRAY['Bíceps','Braquial'],
    ARRAY['Antebrazos'],
    'pull',
    'beginner',
    'isolation',
    'dumbbell',
    'strength',
    0.8,
    0,
    true,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hammer Grip Incline DB Bench Press',
    'Press Inclinado',
    ARRAY['Pecho'],
    ARRAY['Hombros','Tríceps'],
    'push',
    'beginner',
    'compound',
    'dumbbell',
    'strength',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Handstand Push-Ups',
    'Flexiones Verticales (Pino)',
    ARRAY['Hombros'],
    ARRAY['Tríceps'],
    'push',
    'expert',
    'compound',
    'body only',
    'strength',
    1,
    1,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hang Clean',
    'Cargada Colgante',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Antebrazos','Glúteos','Isquios','Lumbar','Hombros','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hang Clean - Below the Knees',
    'Hang Clean - Below the Knees',
    ARRAY['Cuádriceps'],
    ARRAY['Gemelos','Antebrazos','Glúteos','Isquios','Lumbar','Hombros','Trapecio'],
    'pull',
    'intermediate',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hang Snatch',
    'Arrancada Colgante',
    ARRAY['Isquios'],
    ARRAY['Abdominales','Gemelos','Antebrazos','Glúteos','Lumbar','Cuádriceps','Hombros','Trapecio'],
    'pull',
    'expert',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hang Snatch - Below Knees',
    'Hang Snatch - Below Knees',
    ARRAY['Isquios'],
    ARRAY['Abdominales','Gemelos','Antebrazos','Glúteos','Lumbar','Cuádriceps','Hombros','Trapecio'],
    'pull',
    'expert',
    'compound',
    'barbell',
    'olympic weightlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;
INSERT INTO public.exercises (name, name_es, primary_muscles, secondary_muscles, force, level, mechanic, equipment, category, intensity_factor, bodyweight_factor, is_popular, muscle_heads)
VALUES (
    'Hanging Bar Good Morning',
    'Buenos Días',
    ARRAY['Isquios'],
    ARRAY['Abdominales','Glúteos','Lumbar'],
    'push',
    'intermediate',
    'compound',
    'barbell',
    'powerlifting',
    1,
    0,
    false,
    '[]'
) ON CONFLICT (name) DO UPDATE SET name_es = EXCLUDED.name_es, primary_muscles = EXCLUDED.primary_muscles, secondary_muscles = EXCLUDED.secondary_muscles, is_popular = EXCLUDED.is_popular, muscle_heads = EXCLUDED.muscle_heads;