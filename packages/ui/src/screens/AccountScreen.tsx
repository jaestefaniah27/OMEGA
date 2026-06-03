import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Tv, Gift, Settings as SettingsIcon, ChevronRight, LogOut } from 'lucide-react-native';
import { useUserStats, supabase } from '@omega/logic';
import { Screen, Header, Card, Section, Button, TextField, SegmentedControl, ProgressBar, ListRow } from '../components/ui';
import { colors, space, radius, font } from '../theme/tokens';

const ATTRS: { key: string; label: string; color: string }[] = [
    { key: 'mastery', label: 'Maestría', color: colors.projects },
    { key: 'wisdom', label: 'Sabiduría', color: colors.study },
    { key: 'vigor', label: 'Vigor', color: colors.gym },
    { key: 'discipline', label: 'Disciplina', color: colors.health },
];

export const AccountScreen: React.FC = () => {
    const nav = useNavigation<any>();
    const { profile, heroStats } = useUserStats();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
    }, []);

    if (!session) return <AuthView />;

    const level = heroStats?.global_level ?? 1;
    const xp = profile?.current_xp ?? 0;
    const maxXp = (profile as any)?.max_xp ?? 100;

    return (
        <Screen>
            <Header title="Perfil" subtitle={profile?.username || session.user?.email} accent={colors.accent} />

            <Card style={{ marginTop: space.sm }}>
                <View style={styles.levelRow}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.username || 'O')[0].toUpperCase()}</Text></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.username}>{profile?.username || 'Aventurero'}</Text>
                        <Text style={styles.muted}>Nivel {level}</Text>
                    </View>
                    <Text style={styles.gold}>{profile?.gold ?? 0} ⟡</Text>
                </View>
                <View style={{ marginTop: space.md }}>
                    <ProgressBar progress={maxXp ? xp / maxXp : 0} color={colors.accent} />
                    <Text style={[styles.muted, { marginTop: space.xs }]}>{xp} / {maxXp} XP</Text>
                </View>
            </Card>

            <Section title="Atributos">
                {ATTRS.map(a => {
                    const lvl = (heroStats as any)?.[`${a.key}_level`] ?? 1;
                    const axp = (heroStats as any)?.[`${a.key}_xp`] ?? 0;
                    return (
                        <Card key={a.key} style={{ marginBottom: space.sm }}>
                            <View style={styles.attrRow}>
                                <View style={[styles.attrDot, { backgroundColor: a.color }]} />
                                <Text style={styles.attrLabel}>{a.label}</Text>
                                <Text style={styles.attrLevel}>Nv {lvl}</Text>
                            </View>
                            <View style={{ marginTop: space.sm }}>
                                <ProgressBar progress={(axp % 100) / 100} color={a.color} height={6} />
                            </View>
                        </Card>
                    );
                })}
            </Section>

            <Section title="Más">
                <ListRow title="Agenda" subtitle="Tareas y calendario" left={<Calendar size={20} color={colors.accent} />} right={<ChevronRight size={18} color={colors.textFaint} />} onPress={() => nav.navigate('Agenda')} />
                <ListRow title="Ocio" subtitle="Pelis, series, actividades" left={<Tv size={20} color={colors.leisure} />} right={<ChevronRight size={18} color={colors.textFaint} />} onPress={() => nav.navigate('Ocio')} />
                <ListRow title="Recompensas" subtitle="Canjea tu oro" left={<Gift size={20} color={colors.warning} />} right={<ChevronRight size={18} color={colors.textFaint} />} onPress={() => nav.navigate('Recompensas')} />
                <ListRow title="Ajustes" subtitle="Cuenta, calendario, sesión" left={<SettingsIcon size={20} color={colors.textMuted} />} right={<ChevronRight size={18} color={colors.textFaint} />} onPress={() => nav.navigate('Ajustes')} />
            </Section>

            <Button title="Cerrar sesión" variant="ghost" icon={<LogOut size={16} color={colors.textMuted} />} style={{ marginTop: space.lg }}
                onPress={() => Alert.alert('Cerrar sesión', '¿Seguro?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Salir', style: 'destructive', onPress: () => supabase.auth.signOut() }])} />
        </Screen>
    );
};

const AuthView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password, options: { data: { username: username || email.split('@')[0] } } });
                if (error) throw error;
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally { setLoading(false); }
    };

    return (
        <Screen>
            <Header title="OMEGA" subtitle="Tu vida, en orden" accent={colors.accent} />
            <Card style={{ marginTop: space.lg }}>
                <SegmentedControl options={['Entrar', 'Crear cuenta']} value={isLogin ? 0 : 1} onChange={i => setIsLogin(i === 0)} />
                <View style={{ marginTop: space.lg, gap: space.md }}>
                    {!isLogin && <TextField value={username} onChangeText={setUsername} placeholder="Nombre de usuario" label="Usuario" autoCapitalize="none" />}
                    <TextField value={email} onChangeText={setEmail} placeholder="tu@email.com" label="Email" keyboardType="email-address" autoCapitalize="none" />
                    <TextField value={password} onChangeText={setPassword} placeholder="••••••••" label="Contraseña" secureTextEntry />
                    <Button title={isLogin ? 'Entrar' : 'Crear cuenta'} color={colors.accent} loading={loading} onPress={submit} fullWidth />
                </View>
            </Card>
        </Screen>
    );
};

const styles = StyleSheet.create({
    levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    avatar: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.accent, fontSize: font.size.lg, fontWeight: font.weight.bold },
    username: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold },
    muted: { color: colors.textMuted, fontSize: font.size.sm },
    gold: { color: colors.warning, fontSize: font.size.md, fontWeight: font.weight.bold },
    attrRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    attrDot: { width: 10, height: 10, borderRadius: 5 },
    attrLabel: { flex: 1, color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
    attrLevel: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: font.weight.bold },
});
