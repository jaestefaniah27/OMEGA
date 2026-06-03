import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Check, Trash2 } from 'lucide-react-native';
import { useGame } from '@omega/logic';
import { Screen, Header, Card, Section, Button, TextField, EmptyState, IconButton, BottomSheet } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

export const AgendaScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const { castle } = useGame();
    const [addOpen, setAddOpen] = useState(false);
    const [title, setTitle] = useState('');

    const pending = (castle.decrees || []).filter(d => d.status === 'PENDING');
    const completed = (castle.decrees || []).filter(d => d.status === 'COMPLETED').slice(0, 20);

    const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin fecha';

    return (
        <Screen>
            <Header title="Agenda" accent={colors.accent}
                right={<IconButton icon={<Plus size={22} color={colors.accent} />} onPress={() => setAddOpen(true)} />} />
            <Pressable onPress={() => nav.goBack()} style={styles.back}><ChevronLeft size={18} color={colors.textMuted} /><Text style={styles.backText}>Atrás</Text></Pressable>

            <Section title="Pendientes">
                {pending.length === 0 ? <EmptyState title="Nada pendiente" /> :
                    pending.map(d => (
                        <Card key={d.id} accent={d.type === 'EXAM' ? colors.danger : colors.accent} style={{ marginBottom: space.sm }}>
                            <View style={styles.taskRow}>
                                <Pressable onPress={() => castle.updateDecree(d.id, { status: 'COMPLETED', completed_at: new Date().toISOString() } as any)} style={styles.checkbox} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.taskTitle}>{d.title}</Text>
                                    <Text style={styles.muted}>{d.type === 'EXAM' ? 'Examen · ' : ''}{fmtDate(d.due_date)}</Text>
                                </View>
                                <Pressable onPress={() => castle.deleteDecree(d.id)}><Trash2 size={16} color={colors.textFaint} /></Pressable>
                            </View>
                        </Card>
                    ))}
            </Section>

            {completed.length > 0 && (
                <Section title="Completadas">
                    {completed.map(d => (
                        <View key={d.id} style={styles.doneRow}>
                            <Check size={16} color={colors.success} />
                            <Text style={styles.doneText}>{d.title}</Text>
                        </View>
                    ))}
                </Section>
            )}

            <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} title="Nueva tarea">
                <TextField value={title} onChangeText={setTitle} placeholder="¿Qué hay que hacer?" />
                <Button title="Añadir" color={colors.accent} fullWidth style={{ marginTop: space.md }}
                    onPress={async () => {
                        if (title.trim()) {
                            await castle.addDecree({ title: title.trim(), type: 'GENERAL', status: 'PENDING', target_quantity: 1, unit: 'SESSIONS', due_date: new Date().toISOString() } as any);
                            setTitle(''); setAddOpen(false);
                        }
                    }} />
            </BottomSheet>
        </Screen>
    );
};

const styles = StyleSheet.create({
    back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: space.sm },
    backText: { color: colors.textMuted, fontSize: font.size.sm },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    checkbox: { width: 24, height: 24, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong },
    taskTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
    muted: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
    doneRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, opacity: 0.6 },
    doneText: { color: colors.textMuted, fontSize: font.size.sm, textDecorationLine: 'line-through' },
});
