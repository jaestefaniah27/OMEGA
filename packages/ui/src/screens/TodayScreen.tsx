import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, Calendar, Dumbbell, Target, ChevronRight, Flame, Timer } from 'lucide-react-native';
import { useGame, useWorkout, usePendingSyncCount } from '@omega/logic';
import { Screen, Header, Card, Section, ProgressBar, EmptyState, ListRow } from '../components/ui';
import { colors, space, radius, font, domainColor } from '../theme/tokens';

const todayStr = () => new Date().toISOString().split('T')[0];

export const TodayScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const { castle, habits, profile, heroStats } = useGame();
    const workout = useWorkout();
    const pendingSync = usePendingSyncCount();

    const today = todayStr();
    const dueToday = (castle.decrees || []).filter(d => {
        if (d.status !== 'PENDING') return false;
        if (!d.due_date) return false;
        return new Date(d.due_date).toISOString().split('T')[0] === today;
    });

    const logs = habits.todayLogs || [];
    const doneCount = logs.filter(l => l.completed).length;

    const level = heroStats?.global_level ?? 1;
    const xp = profile?.current_xp ?? 0;
    const maxXp = (profile as any)?.max_xp ?? 100;

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 6) return 'Buenas noches';
        if (h < 14) return 'Buenos días';
        if (h < 21) return 'Buenas tardes';
        return 'Buenas noches';
    })();

    return (
        <Screen>
            <Header
                title="Hoy"
                subtitle={`${greeting}${profile?.username ? `, ${profile.username}` : ''}`}
                right={
                    <Pressable style={styles.levelChip} onPress={() => nav.navigate('Perfil')}>
                        <Flame size={14} color={colors.leisure} />
                        <Text style={styles.levelText}>Nv {level}</Text>
                    </Pressable>
                }
            />

            {pendingSync > 0 && (
                <View style={styles.syncPill}>
                    <Text style={styles.syncText}>{pendingSync} cambio{pendingSync > 1 ? 's' : ''} sin sincronizar · se guardará al volver la conexión</Text>
                </View>
            )}

            {/* XP */}
            <Card style={{ marginTop: space.sm }}>
                <View style={styles.xpRow}>
                    <Text style={styles.xpLabel}>Experiencia</Text>
                    <Text style={styles.xpVal}>{xp} / {maxXp}</Text>
                </View>
                <ProgressBar progress={maxXp ? xp / maxXp : 0} color={colors.accent} />
            </Card>

            {/* Sesión de gimnasio activa */}
            {workout.isSessionActive && (
                <Card accent={colors.gym} style={{ marginTop: space.md }} onPress={() => nav.navigate('Gimnasio')}>
                    <View style={styles.sessionRow}>
                        <Timer size={18} color={colors.gym} />
                        <Text style={styles.sessionText}>Entrenamiento en curso</Text>
                        <Text style={styles.sessionTimer}>{workout.formatTime}</Text>
                    </View>
                </Card>
            )}

            {/* Accesos rápidos */}
            <Section title="Empezar">
                <View style={styles.quickRow}>
                    <QuickAction label="Estudiar" icon={<Target size={20} color={colors.study} />} color={colors.study} onPress={() => nav.navigate('Enfoque')} />
                    <QuickAction label="Entrenar" icon={<Dumbbell size={20} color={colors.gym} />} color={colors.gym} onPress={() => nav.navigate('Gimnasio')} />
                    <QuickAction label="Agenda" icon={<Calendar size={20} color={colors.accent} />} color={colors.accent} onPress={() => nav.navigate('Agenda')} />
                </View>
            </Section>

            {/* Hábitos de hoy */}
            <Section title="Hábitos" right={<Text style={styles.counter}>{doneCount}/{logs.length}</Text>}>
                {logs.length === 0 ? (
                    <EmptyState title="Sin hábitos para hoy" subtitle="Crea hábitos desde Agenda" />
                ) : (
                    logs.map(log => (
                        <Pressable
                            key={log.id}
                            onPress={() => habits.toggleHabit(log.id, !log.completed)}
                            style={[styles.habit, log.completed ? styles.habitDone : null]}
                        >
                            <View style={[styles.checkbox, log.completed ? styles.checkboxOn : null]}>
                                {log.completed ? <Check size={14} color={colors.onAccent} /> : null}
                            </View>
                            <Text style={[styles.habitText, log.completed ? styles.habitTextDone : null]}>
                                {log.definition?.title || 'Hábito'}
                            </Text>
                        </Pressable>
                    ))
                )}
            </Section>

            {/* Tareas de hoy */}
            <Section title="Tareas de hoy" right={
                <Pressable onPress={() => nav.navigate('Agenda')}><ChevronRight size={20} color={colors.textMuted} /></Pressable>
            }>
                {dueToday.length === 0 ? (
                    <EmptyState title="Nada pendiente hoy" subtitle="Disfruta o adelanta trabajo" />
                ) : (
                    dueToday.map(d => (
                        <ListRow
                            key={d.id}
                            title={d.title}
                            subtitle={d.type === 'EXAM' ? 'Examen' : `${d.current_quantity || 0}/${d.target_quantity || 1} ${(d.unit || '').toLowerCase()}`}
                            onPress={() => nav.navigate('Agenda')}
                            left={<View style={[styles.dot, { backgroundColor: d.type === 'EXAM' ? colors.danger : colors.accent }]} />}
                        />
                    ))
                )}
            </Section>
        </Screen>
    );
};

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; color: string; onPress: () => void }> = ({ label, icon, color, onPress }) => (
    <Pressable onPress={onPress} style={styles.quick}>
        <View style={[styles.quickIcon, { backgroundColor: `${color}22` }]}>{icon}</View>
        <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    levelChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.sm, borderWidth: 1, borderColor: colors.border },
    levelText: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.bold },
    xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
    xpLabel: { color: colors.textMuted, fontSize: font.size.sm },
    xpVal: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.bold },
    sessionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    sessionText: { flex: 1, color: colors.text, fontWeight: font.weight.medium },
    sessionTimer: { color: colors.gym, fontWeight: font.weight.bold, fontVariant: ['tabular-nums'] },
    quickRow: { flexDirection: 'row', gap: space.md },
    quick: { flex: 1, alignItems: 'center', gap: space.sm, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: space.lg },
    quickIcon: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.medium },
    counter: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: font.weight.bold },
    habit: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space.md, marginBottom: space.sm },
    habitDone: { opacity: 0.6 },
    checkbox: { width: 24, height: 24, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
    checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
    habitText: { color: colors.text, fontSize: font.size.md },
    habitTextDone: { textDecorationLine: 'line-through', color: colors.textMuted },
    dot: { width: 10, height: 10, borderRadius: 5 },
    syncPill: { marginTop: space.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.warning, paddingVertical: space.sm, paddingHorizontal: space.md },
    syncText: { color: colors.warning, fontSize: font.size.xs, fontWeight: font.weight.medium },
});
