import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Dumbbell, Plus, Check, X, Search, Flag } from 'lucide-react-native';
import { useRoutines, useWorkout, supabase } from '@omega/logic';
import { Screen, Header, Card, Section, Button, Chip, ListRow, EmptyState, BottomSheet, TimerDisplay, NumberStepper } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

export const GymScreen: React.FC = () => {
    const { routines, history, createRoutine } = useRoutines();
    const workout = useWorkout();

    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');

    if (workout.isSessionActive) return <ActiveSession />;

    return (
        <Screen>
            <Header title="Gimnasio" accent={colors.gym} />

            <Section title="Empezar entrenamiento">
                <View style={styles.chipsRow}>
                    <Pressable style={[styles.startChip, { borderColor: colors.gym }]} onPress={() => workout.startSession(null, [])}>
                        <Flag size={16} color={colors.gym} />
                        <Text style={[styles.startChipText, { color: colors.gym }]}>Sesión libre</Text>
                    </Pressable>
                    {routines.map(r => (
                        <Pressable key={r.id} style={styles.startChip} onPress={() => workout.startSession(r.id, (r as any).exercises || [])}>
                            <Dumbbell size={16} color={colors.text} />
                            <Text style={styles.startChipText}>{r.name}</Text>
                        </Pressable>
                    ))}
                </View>
                <Button title="Nueva rutina" variant="surface" icon={<Plus size={18} color={colors.text} />} onPress={() => setCreateOpen(true)} fullWidth style={{ marginTop: space.md }} />
            </Section>

            <Section title="Historial">
                {history.length === 0 ? (
                    <EmptyState title="Sin entrenamientos aún" subtitle="Tu primer entrenamiento aparecerá aquí" />
                ) : history.map(h => (
                    <ListRow key={h.id} title={h.routine} subtitle={`${h.date} · ${h.duration} · ${h.tonnage}`} left={<Dumbbell size={18} color={colors.gym} />} />
                ))}
            </Section>

            <BottomSheet visible={createOpen} onClose={() => setCreateOpen(false)} title="Nueva rutina">
                <TextInput value={newName} onChangeText={setNewName} placeholder="Nombre de la rutina" placeholderTextColor={colors.textFaint} style={styles.input} />
                <Button title="Crear" color={colors.gym} fullWidth style={{ marginTop: space.md }}
                    onPress={async () => { if (newName.trim()) { await createRoutine(newName.trim()); setNewName(''); setCreateOpen(false); } }} />
            </BottomSheet>
        </Screen>
    );
};

const ActiveSession: React.FC = () => {
    const workout = useWorkout();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const search = useCallback(async (text: string) => {
        setQuery(text);
        const q = supabase.from('exercises').select('id, name, name_es');
        const { data } = text.length < 2
            ? await q.order('name_es', { ascending: true }).limit(30)
            : await q.or(`name.ilike.%${text}%,name_es.ilike.%${text}%`).limit(20);
        setResults(data || []);
    }, []);

    useEffect(() => { if (pickerOpen) search(''); }, [pickerOpen, search]);

    // Agrupar sets por ejercicio
    const groups: Record<string, { name: string; sets: any[] }> = {};
    (workout.setsLog || []).forEach(s => {
        if (!groups[s.exercise_id]) groups[s.exercise_id] = { name: s.exercise_name, sets: [] };
        groups[s.exercise_id].sets.push(s);
    });

    return (
        <Screen>
            <Header title="Entrenando" subtitle="Sesión en curso" accent={colors.gym}
                right={<TimerDisplay text={workout.formatTime} size={22} color={colors.gym} />} />

            {Object.keys(groups).length === 0 ? (
                <EmptyState title="Añade tu primer ejercicio" />
            ) : Object.entries(groups).map(([exId, g]) => (
                <Card key={exId} style={{ marginBottom: space.md }}>
                    <Text style={styles.exName}>{g.name}</Text>
                    {g.sets.map((set, i) => (
                        <View key={set.id} style={styles.setRow}>
                            <Text style={styles.setIdx}>{i + 1}</Text>
                            <SetField label="kg" value={set.weight} onChange={v => workout.updateSet(set.id, { weight: v })} step={2.5} />
                            <SetField label="reps" value={set.reps} onChange={v => workout.updateSet(set.id, { reps: v })} step={1} />
                            <Pressable onPress={() => workout.updateSet(set.id, { completed: !set.completed })} style={[styles.setCheck, set.completed ? styles.setCheckOn : null]}>
                                {set.completed ? <Check size={16} color={colors.onAccent} /> : null}
                            </Pressable>
                            <Pressable onPress={() => workout.removeSet(set.id)}><X size={16} color={colors.textFaint} /></Pressable>
                        </View>
                    ))}
                    <Pressable onPress={() => workout.addSet(exId, g.name)} style={styles.addSet}>
                        <Plus size={14} color={colors.gym} /><Text style={styles.addSetText}>Añadir serie</Text>
                    </Pressable>
                </Card>
            ))}

            <Button title="Añadir ejercicio" variant="surface" icon={<Plus size={18} color={colors.text} />} onPress={() => setPickerOpen(true)} fullWidth style={{ marginTop: space.sm }} />
            <Button title="Terminar entrenamiento" color={colors.gym} onPress={() => workout.finishSession()} fullWidth style={{ marginTop: space.md }} />

            <BottomSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} title="Ejercicios">
                <View style={styles.searchBox}>
                    <Search size={18} color={colors.textMuted} />
                    <TextInput value={query} onChangeText={search} placeholder="Buscar ejercicio" placeholderTextColor={colors.textFaint} style={styles.searchInput} />
                </View>
                <View style={{ maxHeight: 320 }}>
                    {results.map(ex => (
                        <Pressable key={ex.id} style={styles.resultRow} onPress={() => { workout.addSet(ex.id, ex.name_es || ex.name); setPickerOpen(false); }}>
                            <Text style={styles.resultText}>{ex.name_es || ex.name}</Text>
                            <Plus size={16} color={colors.gym} />
                        </Pressable>
                    ))}
                </View>
            </BottomSheet>
        </Screen>
    );
};

const SetField: React.FC<{ label: string; value: number; onChange: (v: number) => void; step: number }> = ({ label, value, onChange, step }) => (
    <View style={{ flex: 1 }}>
        <NumberStepper value={value} onChange={onChange} step={step} min={0} />
        <Text style={styles.setLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    startChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.sm },
    startChipText: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.medium },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: font.size.md, padding: space.md },
    exName: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold, marginBottom: space.sm },
    setRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.xs },
    setIdx: { color: colors.textMuted, width: 16, textAlign: 'center', fontWeight: font.weight.bold },
    setLabel: { color: colors.textFaint, fontSize: 10, textAlign: 'center', marginTop: 2 },
    setCheck: { width: 36, height: 36, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
    setCheckOn: { backgroundColor: colors.gym, borderColor: colors.gym },
    addSet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, marginTop: space.sm, paddingVertical: space.sm },
    addSetText: { color: colors.gym, fontSize: font.size.sm, fontWeight: font.weight.bold },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: space.md, marginBottom: space.md },
    searchInput: { flex: 1, color: colors.text, fontSize: font.size.md, paddingVertical: space.md },
    resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    resultText: { color: colors.text, fontSize: font.size.md },
});
