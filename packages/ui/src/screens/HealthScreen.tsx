import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Droplet, Moon, Heart, Plus, Sparkles } from 'lucide-react-native';
import { useTavern, useTemple } from '@omega/logic';
import { Screen, Header, Card, Section, SegmentedControl, Button, TextField, ProgressBar, EmptyState, NumberStepper } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

export const HealthScreen: React.FC = () => {
    const [tab, setTab] = useState(0);
    return (
        <Screen>
            <Header title="Salud" accent={colors.health} />
            <View style={{ marginTop: space.sm, marginBottom: space.md }}>
                <SegmentedControl options={['Agua', 'Sueño', 'Diario']} value={tab} onChange={setTab} accent={colors.health} />
            </View>
            {tab === 0 ? <WaterTab /> : tab === 1 ? <SleepTab /> : <JournalTab />}
        </Screen>
    );
};

const WaterTab: React.FC = () => {
    const { todayWater, recommendedWater, registerWater, isGoalReached } = useTavern();
    return (
        <Card>
            <Text style={styles.bigStat}>{todayWater}<Text style={styles.bigStatUnit}> / {recommendedWater} vasos</Text></Text>
            <View style={{ marginVertical: space.md }}>
                <ProgressBar progress={recommendedWater ? todayWater / recommendedWater : 0} color={colors.health} height={12} />
            </View>
            <Text style={styles.muted}>{isGoalReached ? '¡Objetivo de hidratación cumplido!' : `Te faltan ${Math.max(0, recommendedWater - todayWater)} vasos`}</Text>
            <Button title="Beber un vaso" icon={<Droplet size={18} color={colors.onAccent} />} color={colors.health} onPress={() => registerWater(1)} fullWidth style={{ marginTop: space.lg }} />
        </Card>
    );
};

const SleepTab: React.FC = () => {
    const { todaySleep, registerSleep } = useTemple();
    const [hours, setHours] = useState(8);
    return (
        <View>
            <Card>
                <View style={styles.sleepHead}>
                    <Moon size={20} color={colors.health} />
                    <Text style={styles.cardTitle}>Sueño de hoy</Text>
                </View>
                {todaySleep ? (
                    <Text style={styles.bigStat}>{todaySleep.hours}<Text style={styles.bigStatUnit}> horas</Text></Text>
                ) : (
                    <Text style={styles.muted}>Aún no has registrado el sueño de hoy.</Text>
                )}
            </Card>
            <Card style={{ marginTop: space.md }}>
                <Text style={styles.label}>¿Cuántas horas dormiste?</Text>
                <View style={{ marginVertical: space.md }}>
                    <NumberStepper value={hours} onChange={setHours} min={0} step={1} suffix="h" />
                </View>
                <Button title="Registrar sueño" color={colors.health} onPress={() => registerSleep(hours)} fullWidth />
            </Card>
        </View>
    );
};

const JournalTab: React.FC = () => {
    const { positiveThoughts, negativeThoughts, addGratitude, addWorry, unleashWorry } = useTemple();
    const [grat, setGrat] = useState('');
    const [worry, setWorry] = useState('');
    return (
        <View>
            <Section title="Gratitud">
                <Card>
                    <TextField value={grat} onChangeText={setGrat} placeholder="¿Por qué estás agradecido hoy?" multiline />
                    <Button title="Añadir" icon={<Plus size={18} color={colors.onAccent} />} color={colors.health}
                        onPress={() => { if (grat.trim()) { addGratitude(grat.trim()); setGrat(''); } }} fullWidth style={{ marginTop: space.md }} />
                    {positiveThoughts.length === 0 ? null : positiveThoughts.map(t => (
                        <View key={t.id} style={styles.entry}>
                            <Sparkles size={14} color={colors.health} />
                            <Text style={styles.entryText}>{t.content}</Text>
                        </View>
                    ))}
                </Card>
            </Section>
            <Section title="Preocupaciones">
                <Card>
                    <TextField value={worry} onChangeText={setWorry} placeholder="Suéltalo aquí…" multiline />
                    <Button title="Anotar" variant="surface"
                        onPress={() => { if (worry.trim()) { addWorry(worry.trim()); setWorry(''); } }} fullWidth style={{ marginTop: space.md }} />
                    {negativeThoughts.length === 0 ? (
                        <EmptyState title="Sin preocupaciones pendientes" />
                    ) : negativeThoughts.map(t => (
                        <View key={t.id} style={styles.entry}>
                            <Text style={[styles.entryText, { flex: 1 }]}>{t.content}</Text>
                            <Pressable onPress={() => unleashWorry(t.id)}><Text style={styles.release}>Liberar</Text></Pressable>
                        </View>
                    ))}
                </Card>
            </Section>
        </View>
    );
};

const styles = StyleSheet.create({
    bigStat: { color: colors.text, fontSize: font.size.xxl, fontWeight: font.weight.bold },
    bigStatUnit: { color: colors.textMuted, fontSize: font.size.md, fontWeight: font.weight.regular },
    muted: { color: colors.textMuted, fontSize: font.size.sm },
    sleepHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
    cardTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold },
    label: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: font.weight.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
    entry: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border },
    entryText: { color: colors.text, fontSize: font.size.sm },
    release: { color: colors.health, fontSize: font.size.sm, fontWeight: font.weight.bold },
});
