import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CalendarCheck, RefreshCw, LogOut, User } from 'lucide-react-native';
import { useGame, supabase } from '@omega/logic';
import { Screen, Header, Card, Section, Button, ListRow } from '../components/ui';
import { colors, space, font } from '../theme/tokens';

export const AppSettingsScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const { calendar, profile } = useGame();

    return (
        <Screen>
            <Header title="Ajustes" accent={colors.textMuted} />
            <Pressable onPress={() => nav.goBack()} style={styles.back}><ChevronLeft size={18} color={colors.textMuted} /><Text style={styles.backText}>Atrás</Text></Pressable>

            <Section title="Cuenta">
                <ListRow title={profile?.username || 'Aventurero'} subtitle="Usuario" left={<User size={20} color={colors.accent} />} />
            </Section>

            <Section title="Calendario">
                <Card>
                    <Text style={styles.muted}>Importa eventos de tu calendario nativo como tareas y exporta tus exámenes.</Text>
                    <Button title="Conceder permiso" variant="surface" icon={<CalendarCheck size={18} color={colors.text} />} fullWidth style={{ marginTop: space.md }}
                        onPress={() => calendar.requestPermission()} />
                    <Button title={calendar.isSyncing ? 'Sincronizando…' : 'Sincronizar ahora'} color={colors.accent} icon={<RefreshCw size={16} color={colors.onAccent} />} fullWidth style={{ marginTop: space.sm }}
                        disabled={calendar.isSyncing} onPress={() => calendar.syncNativeEventsToDecrees()} />
                </Card>
            </Section>

            <Button title="Cerrar sesión" variant="ghost" icon={<LogOut size={16} color={colors.textMuted} />} style={{ marginTop: space.xl }}
                onPress={() => Alert.alert('Cerrar sesión', '¿Seguro?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Salir', style: 'destructive', onPress: () => supabase.auth.signOut() }])} />
        </Screen>
    );
};

const styles = StyleSheet.create({
    back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: space.sm },
    backText: { color: colors.textMuted, fontSize: font.size.sm },
    muted: { color: colors.textMuted, fontSize: font.size.sm },
});
