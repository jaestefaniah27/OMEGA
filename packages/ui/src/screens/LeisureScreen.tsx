import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Play, Square, Film, Tv } from 'lucide-react-native';
import { useTheatre } from '@omega/logic';
import { Screen, Header, Card, Section, SegmentedControl, Button, TextField, EmptyState, IconButton, BottomSheet, TimerDisplay, ListRow } from '../components/ui';
import { colors, space, font } from '../theme/tokens';

const fmt = (s: number) => { const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export const LeisureScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const t = useTheatre();
    const [tab, setTab] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const [name, setName] = useState('');

    const add = async () => {
        if (!name.trim()) return;
        if (tab === 0) await t.addActivity(name.trim());
        else if (tab === 1) await t.addMovie(name.trim());
        else await t.addSeries(name.trim());
        setName(''); setAddOpen(false);
    };

    return (
        <Screen>
            <Header title="Ocio" accent={colors.leisure}
                right={<IconButton icon={<Plus size={22} color={colors.leisure} />} onPress={() => setAddOpen(true)} />} />
            <Pressable onPress={() => nav.goBack()} style={styles.back}><ChevronLeft size={18} color={colors.textMuted} /><Text style={styles.backText}>Atrás</Text></Pressable>

            <SegmentedControl options={['Actividades', 'Pelis', 'Series']} value={tab} onChange={setTab} accent={colors.leisure} />

            {t.isSessionActive && (
                <Card accent={colors.leisure} style={{ marginTop: space.md }}>
                    <Text style={styles.muted}>{t.selectedActivity?.name}</Text>
                    <View style={{ alignItems: 'center', marginVertical: space.md }}><TimerDisplay text={fmt(t.elapsedSeconds)} color={colors.leisure} size={36} /></View>
                    <Button title="Terminar" icon={<Square size={16} color={colors.onAccent} />} color={colors.leisure} onPress={() => t.stopSession()} fullWidth />
                </Card>
            )}

            <View style={{ marginTop: space.md }}>
                {tab === 0 && (t.activities.length === 0 ? <EmptyState title="Sin actividades" /> :
                    t.activities.map((a: any) => (
                        <Card key={a.id} style={{ marginBottom: space.sm }}>
                            <View style={styles.row}>
                                <Text style={styles.name}>{a.name}</Text>
                                <Text style={styles.muted}>{Math.round((a.total_minutes || 0) / 60)}h</Text>
                                {!t.isSessionActive && <Pressable onPress={() => t.startSession(a)} style={styles.playBtn}><Play size={16} color={colors.leisure} /></Pressable>}
                            </View>
                        </Card>
                    )))}
                {tab === 1 && (t.movies.length === 0 ? <EmptyState title="Sin películas" /> :
                    t.movies.map((m: any) => <ListRow key={m.id} title={m.title} subtitle={m.director || undefined} left={<Film size={18} color={colors.leisure} />} />))}
                {tab === 2 && (t.series.length === 0 ? <EmptyState title="Sin series" /> :
                    t.series.map((sr: any) => <ListRow key={sr.id} title={sr.title} subtitle={`${(sr.seasons || []).length} temporadas`} left={<Tv size={18} color={colors.leisure} />} />))}
            </View>

            <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} title={tab === 0 ? 'Nueva actividad' : tab === 1 ? 'Nueva película' : 'Nueva serie'}>
                <TextField value={name} onChangeText={setName} placeholder="Título" />
                <Button title="Añadir" color={colors.leisure} fullWidth style={{ marginTop: space.md }} onPress={add} />
            </BottomSheet>
        </Screen>
    );
};

const styles = StyleSheet.create({
    back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: space.md },
    backText: { color: colors.textMuted, fontSize: font.size.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    name: { flex: 1, color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
    muted: { color: colors.textMuted, fontSize: font.size.sm },
    playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.leisure}22`, alignItems: 'center', justifyContent: 'center' },
});
