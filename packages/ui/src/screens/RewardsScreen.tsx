import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Gift, Lock } from 'lucide-react-native';
import { useGame } from '@omega/logic';
import { Screen, Header, Card, Section, EmptyState } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

export const RewardsScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const { profile } = useGame();

    return (
        <Screen>
            <Header title="Recompensas" accent={colors.warning} />
            <Pressable onPress={() => nav.goBack()} style={styles.back}><ChevronLeft size={18} color={colors.textMuted} /><Text style={styles.backText}>Atrás</Text></Pressable>

            <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
                <Text style={styles.balance}>{profile?.gold ?? 0} ⟡</Text>
                <Text style={styles.muted}>Oro disponible</Text>
            </Card>

            <Section title="Tienda">
                <EmptyState icon={<Lock size={28} color={colors.textFaint} />} title="Próximamente"
                    subtitle="Canjea oro ganado con tu esfuerzo por recompensas reales (pizza, videojuegos, descansos…)." />
            </Section>
        </Screen>
    );
};

const styles = StyleSheet.create({
    back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: space.sm },
    backText: { color: colors.textMuted, fontSize: font.size.sm },
    balance: { color: colors.warning, fontSize: 44, fontWeight: font.weight.bold },
    muted: { color: colors.textMuted, fontSize: font.size.sm, marginTop: space.xs },
});
