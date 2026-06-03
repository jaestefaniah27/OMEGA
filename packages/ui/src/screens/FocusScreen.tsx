import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BookOpen, Plus, Play, Square, FolderGit2, Zap } from 'lucide-react-native';
import { useLibrary, useMageTower } from '@omega/logic';
import { Screen, Header, Card, Section, SegmentedControl, Button, Chip, TextField, ProgressBar, EmptyState, TimerDisplay, BottomSheet } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

const fmt = (sec: number) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const FocusScreen: React.FC = () => {
    const [tab, setTab] = useState(0);
    return (
        <Screen>
            <Header title="Enfoque" accent={colors.study} />
            <View style={{ marginTop: space.sm, marginBottom: space.md }}>
                <SegmentedControl options={['Estudio', 'Proyectos']} value={tab} onChange={setTab} accent={tab === 0 ? colors.study : colors.projects} />
            </View>
            {tab === 0 ? <StudyView /> : <ProjectsView />}
        </Screen>
    );
};

const StudyView: React.FC = () => {
    const lib = useLibrary();
    const [addOpen, setAddOpen] = useState(false);
    const [name, setName] = useState('');

    return (
        <View>
            {/* Timer activo */}
            {lib.isSessionActive ? (
                <Card accent={colors.study}>
                    <Text style={styles.muted}>{lib.selectedSubject?.name || lib.selectedBook?.title || 'Sesión'}</Text>
                    <View style={{ alignItems: 'center', marginVertical: space.lg }}>
                        <TimerDisplay text={fmt(lib.elapsedSeconds)} color={colors.study} />
                    </View>
                    <Button title="Terminar sesión" icon={<Square size={16} color={colors.onAccent} />} color={colors.study} onPress={() => lib.stopSession()} fullWidth />
                </Card>
            ) : (
                <Card>
                    <Text style={styles.label}>Asignatura</Text>
                    <View style={styles.chipsRow}>
                        {lib.activeSubjects.length === 0 ? <Text style={styles.muted}>Crea tu primera asignatura</Text> :
                            lib.activeSubjects.map((sub: any) => (
                                <Chip key={sub.id} label={sub.name} active={lib.selectedSubject?.id === sub.id} color={sub.color || colors.study} onPress={() => lib.setSelectedSubject(sub)} />
                            ))}
                    </View>
                    <Button title="Empezar a estudiar" icon={<Play size={16} color={colors.onAccent} />} color={colors.study}
                        disabled={!lib.selectedSubject} onPress={() => lib.startSession('SUBJECT')} fullWidth style={{ marginTop: space.lg }} />
                </Card>
            )}

            <Section title="Asignaturas" right={<Pressable onPress={() => setAddOpen(true)}><Plus size={20} color={colors.study} /></Pressable>}>
                {lib.activeSubjects.length === 0 ? <EmptyState title="Sin asignaturas" /> :
                    lib.activeSubjects.map((sub: any) => (
                        <Card key={sub.id} accent={sub.color || colors.study} style={{ marginBottom: space.sm }}>
                            <View style={styles.subRow}>
                                <BookOpen size={18} color={sub.color || colors.study} />
                                <Text style={styles.subName}>{sub.name}</Text>
                                <Text style={styles.muted}>{Math.round((sub.total_minutes_studied || 0) / 60)}h</Text>
                            </View>
                        </Card>
                    ))}
            </Section>

            <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} title="Nueva asignatura">
                <TextField value={name} onChangeText={setName} placeholder="Nombre" />
                <Button title="Crear" color={colors.study} fullWidth style={{ marginTop: space.md }}
                    onPress={async () => { if (name.trim()) { await lib.addSubject(name.trim(), colors.study); setName(''); setAddOpen(false); } }} />
            </BottomSheet>
        </View>
    );
};

const ProjectsView: React.FC = () => {
    const mage = useMageTower();
    const [addOpen, setAddOpen] = useState(false);
    const [name, setName] = useState('');
    const [themeId, setThemeId] = useState<string | null>(null);

    const active = (mage.projects || []).filter((p: any) => p.status === 'ACTIVE');
    const hoursFromMana = (m: number) => (m / 36000).toFixed(1);

    return (
        <View>
            <Section title="Proyectos activos" right={<Pressable onPress={() => setAddOpen(true)}><Plus size={20} color={colors.projects} /></Pressable>}>
                {active.length === 0 ? <EmptyState title="Sin proyectos" subtitle="El maná se acumula midiendo tu actividad en el PC" /> :
                    active.map((p: any) => {
                        const theme = (mage.themes || []).find((t: any) => t.id === p.theme_id);
                        const isChanneling = theme?.active_project_id === p.id;
                        return (
                            <Card key={p.id} accent={theme?.color || colors.projects} style={{ marginBottom: space.sm }} onPress={() => mage.toggleChanneling(p.id, p.theme_id)}>
                                <View style={styles.subRow}>
                                    <FolderGit2 size={18} color={theme?.color || colors.projects} />
                                    <Text style={styles.subName}>{p.name}</Text>
                                    {isChanneling ? <View style={styles.live}><Zap size={11} color={colors.onAccent} /><Text style={styles.liveText}>Canalizando</Text></View> : null}
                                </View>
                                <Text style={[styles.muted, { marginTop: space.sm }]}>{hoursFromMana(p.mana_amount || 0)} h de enfoque acumuladas</Text>
                            </Card>
                        );
                    })}
            </Section>

            {Object.keys(mage.unhandledAuraByTheme || {}).length > 0 && (
                <Section title="Energía pendiente">
                    {Object.entries(mage.unhandledAuraByTheme).map(([tid, aura]: any) => {
                        const theme = (mage.themes || []).find((t: any) => t.id === tid);
                        return (
                            <Card key={tid} style={{ marginBottom: space.sm }}>
                                <Text style={styles.subName}>{theme?.name || 'Ámbito'}: {hoursFromMana(aura)} h sin asignar</Text>
                            </Card>
                        );
                    })}
                </Section>
            )}

            <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} title="Nuevo proyecto">
                <TextField value={name} onChangeText={setName} placeholder="Nombre del proyecto" />
                <Text style={[styles.label, { marginTop: space.md }]}>Ámbito</Text>
                <View style={styles.chipsRow}>
                    {(mage.themes || []).map((t: any) => (
                        <Chip key={t.id} label={t.name} active={themeId === t.id} color={t.color || colors.projects} onPress={() => setThemeId(t.id)} />
                    ))}
                </View>
                <Button title="Crear" color={colors.projects} disabled={!name.trim() || !themeId} fullWidth style={{ marginTop: space.md }}
                    onPress={async () => { if (name.trim() && themeId) { await mage.createProject(name.trim(), themeId); setName(''); setThemeId(null); setAddOpen(false); } }} />
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    muted: { color: colors.textMuted, fontSize: font.size.sm },
    label: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: font.weight.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: space.sm },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    subRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    subName: { flex: 1, color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
    live: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.projects, borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: 3 },
    liveText: { color: colors.onAccent, fontSize: 11, fontWeight: font.weight.bold },
});
