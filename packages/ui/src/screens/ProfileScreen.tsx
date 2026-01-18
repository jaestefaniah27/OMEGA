import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { MedievalButton, ParchmentCard, ScreenWrapper } from '..';
import { supabase, useUserStats, useGame } from '@omega/logic';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, LogOut, Save, Shield, Edit2, Star, Clock, Coins, Zap, BookOpen, Dumbbell, Scroll } from 'lucide-react-native';
import { Calendar as CalendarIcon, RefreshCw, CheckCircle, Smartphone, Boxes } from 'lucide-react-native';


const { width } = Dimensions.get('window');

const AttributeProgressBar = ({ label, level, xp, icon, color }: { label: string, level: number, xp: number, icon: any, color: string }) => {
    const nextLevelXp = Math.pow(level, 2) * 100;
    const prevLevelXp = Math.pow(level - 1, 2) * 100;
    const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

    return (
        <View style={styles.attributeContainer}>
            <View style={styles.attributeHeader}>
                <View style={styles.attributeLabelGroup}>
                    {icon}
                    <Text style={styles.attributeLabel}>{label}</Text>
                </View>
                <View style={styles.attributeLevelGroup}>
                    <Text style={styles.attributeLevelText}>Nivel {level}</Text>
                    <Text style={styles.attributeXpText}>{xp.toLocaleString()} XP</Text>
                </View>
            </View>
            <View style={styles.attributeBarBg}>
                <View style={[styles.attributeBarFill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { profile, heroStats, loading: statsLoading } = useUserStats();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [isLogin, setIsLogin] = useState(true);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    useEffect(() => {
        if (profile?.username) {
            setUsername(profile.username);
        }
    }, [profile]);

    const handleAuth = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username || email.split('@')[0],
                        },
                    },
                });
                if (error) throw error;
                Alert.alert('¡Éxito!', 'Misión de registro completada. Revisa tu email.');
            }
        } catch (error: any) {
            Alert.alert('Error en la misión', error.message);
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || statsLoading;

    if (!session) {
        return (
            <ScreenWrapper background="#1a1a1a">
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>📜 PORTAL DE ACCESO</Text>

                    <ParchmentCard style={styles.authCard}>
                        <View style={styles.tabContainer}>
                            <Text
                                style={[styles.tab, isLogin && styles.activeTab]}
                                onPress={() => setIsLogin(true)}
                            >
                                ENTRAR
                            </Text>
                            <Text
                                style={[styles.tab, !isLogin && styles.activeTab]}
                                onPress={() => setIsLogin(false)}
                            >
                                REGISTRAR
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Mail size={18} color="#3d2b1f" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email del Héroe"
                                placeholderTextColor="rgba(61, 43, 31, 0.5)"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>

                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <User size={18} color="#3d2b1f" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre de Guerrero"
                                    placeholderTextColor="rgba(61, 43, 31, 0.5)"
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Lock size={18} color="#3d2b1f" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña Sagrada"
                                placeholderTextColor="rgba(61, 43, 31, 0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <MedievalButton
                            title={loading ? "CANALIZANDO..." : (isLogin ? "INICIAR SESIÓN" : "REGISTRARSE")}
                            onPress={handleAuth}
                            style={styles.authButton}
                        />
                    </ParchmentCard>

                </ScrollView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper background="#1a1a1a">
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>👤 PERFIL DEL HÉROE</Text>

                {/* RPG HEADER STATS */}
                <ParchmentCard style={styles.rpgHeaderCard}>
                    <View style={styles.rpgHeaderTop}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <User size={50} color="#d4af37" />
                            </View>
                            <Shield size={20} color="#d4af37" style={styles.shieldIcon} />
                        </View>

                        <View style={styles.rankInfo}>
                            <Text style={styles.usernameText}>{profile?.username || 'Guerrero Sin Nombre'}</Text>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Nivel Global {heroStats?.global_level ?? 1}</Text>
                                <Text style={styles.classText}>{profile?.class ?? 'Aprendiz'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* XP BAR */}
                    <View style={styles.statProgressBarContainer}>
                        <View style={styles.progressBarHeader}>
                            <View style={styles.statIconLabel}>
                                <Star size={14} color="#8b4513" />
                                <Text style={styles.progressBarLabel}>EXPERIENCIA (XP)</Text>
                            </View>
                            <Text style={styles.progressBarValue}>{profile?.current_xp ?? 0} / {profile?.max_xp ?? 1000}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${((profile?.current_xp ?? 0) / (profile?.max_xp ?? 1000)) * 100}%`, backgroundColor: '#d4af37' }]} />
                        </View>
                    </View>

                    {/* HP BAR (Sangre/Vida) */}
                    <View style={styles.statProgressBarContainer}>
                        <View style={styles.progressBarHeader}>
                            <View style={styles.statIconLabel}>
                                <Shield size={14} color="#c0392b" />
                                <Text style={styles.progressBarLabel}>PUNTOS DE VIDA (HP)</Text>
                            </View>
                            <Text style={styles.progressBarValue}>{profile?.hp_current ?? 100} / {profile?.hp_max ?? 100}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${((profile?.hp_current ?? 100) / (profile?.hp_max ?? 100)) * 100}%`, backgroundColor: '#c0392b' }]} />
                        </View>
                    </View>

                    {/* GOLD COUNTER */}
                    <View style={styles.headerStatsRow}>
                        <View style={styles.headerStatItem}>
                            <Coins size={18} color="#d4af37" />
                            <Text style={styles.headerStatText}>{profile?.gold ?? 0} Oro</Text>
                        </View>
                        <View style={styles.headerStatItem}>
                            <Boxes size={18} color="#d4af37" />
                            <Text style={styles.headerStatText}>{heroStats?.cronolitos_balance ?? 0} Cronolitos</Text>
                        </View>
                    </View>
                </ParchmentCard>

                {/* HERO ATTRIBUTES CARD */}
                <ParchmentCard style={styles.sectionCard}>
                    <View style={sectionHeaderStyles.container}>
                        <Shield size={20} color="#8b4513" />
                        <Text style={sectionHeaderStyles.title}>ATRIBUTOS DEL HÉROE</Text>
                    </View>

                    <AttributeProgressBar
                        label="MAESTRÍA (TORRE)"
                        level={heroStats?.mastery_level ?? 1}
                        xp={heroStats?.mastery_xp ?? 0}
                        icon={<Zap size={14} color="#8e44ad" />}
                        color="#8e44ad"
                    />

                    <AttributeProgressBar
                        label="SABIDURÍA (BIBLIOTECA)"
                        level={heroStats?.wisdom_level ?? 1}
                        xp={heroStats?.wisdom_xp ?? 0}
                        icon={<BookOpen size={14} color="#2980b9" />}
                        color="#2980b9"
                    />

                    <AttributeProgressBar
                        label="VIGOR (BARRACONES)"
                        level={heroStats?.vigor_level ?? 1}
                        xp={heroStats?.vigor_xp ?? 0}
                        icon={<Dumbbell size={14} color="#c0392b" />}
                        color="#c0392b"
                    />

                    <AttributeProgressBar
                        label="DISCIPLINA (CASTILLO)"
                        level={heroStats?.discipline_level ?? 1}
                        xp={heroStats?.discipline_xp ?? 0}
                        icon={<Scroll size={14} color="#27ae60" />}
                        color="#27ae60"
                    />
                </ParchmentCard>

                <ParchmentCard style={styles.profileCard}>
                    {/* Stats de Estudio */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Clock size={20} color="#8b4513" />
                            <Text style={styles.statLabel}>Tiempo Total</Text>
                            <Text style={styles.statValue}>
                                {Math.floor((profile?.total_study_minutes || 0) / 60)}h {(profile?.total_study_minutes || 0) % 60}m
                            </Text>
                        </View>

                        <View style={styles.statBox}>
                            <Shield size={20} color="#c0392b" />
                            <Text style={styles.statLabel}>Deshonras</Text>
                            <Text style={[styles.statValue, { color: '#c0392b' }]}>
                                {profile?.shame_count || 0}
                            </Text>
                        </View>
                    </View>
                </ParchmentCard>
                <View style={{ height: 100 }} />
            </ScrollView>
            {isLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#FFD700" />
                </View>
            )}
        </ScreenWrapper>
    );
};

const sectionHeaderStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 40,
        marginBottom: 30,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    authCard: {
        width: width * 0.9,
        padding: 25,
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgba(61, 43, 31, 0.4)',
    },
    activeTab: {
        color: '#3d2b1f',
        borderBottomWidth: 3,
        borderBottomColor: '#d4af37',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#3d2b1f',
        fontSize: 14,
    },
    authButton: {
        marginTop: 10,
        width: '100%',
    },
    rpgHeaderCard: {
        width: width * 0.9,
        padding: 20,
        marginBottom: 20,
    },
    rpgHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    rankInfo: {
        marginLeft: 15,
        flex: 1,
    },
    usernameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 4,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8b4513',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    classText: {
        fontSize: 12,
        color: '#3d2b1f',
        fontStyle: 'italic',
    },
    statProgressBarContainer: {
        marginBottom: 15,
    },
    progressBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 6,
    },
    progressBarValue: {
        fontSize: 10,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(61, 43, 31, 0.15)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    headerStatsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 20,
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
    },
    headerStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerStatText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#d4af37',
        marginLeft: 8,
    },
    attributeContainer: {
        marginBottom: 15,
        width: '100%',
    },
    attributeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 6,
    },
    attributeLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attributeLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    attributeLevelGroup: {
        alignItems: 'flex-end',
    },
    attributeLevelText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#3d2b1f',
    },
    attributeXpText: {
        fontSize: 9,
        color: '#8b4513',
        fontWeight: '600',
        opacity: 0.7,
    },
    attributeBarBg: {
        height: 8,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    attributeBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    goldCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
    },
    goldText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d4af37',
        marginLeft: 10,
    },
    profileCard: {
        width: width * 0.9,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3d2b1f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#d4af37',
    },
    shieldIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3d2b1f',
        borderRadius: 12,
        padding: 2,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3d2b1f',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d4af37',
    },
    rankText: {
        color: '#d4af37',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    infoGroup: {
        width: '100%',
        marginBottom: 20,
    },
    editGroup: {
        width: '100%',
        marginBottom: 25,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 5,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 16,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    usernameDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editIconButton: {
        marginLeft: 10,
        padding: 5,
    },
    editInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 15,
        color: '#3d2b1f',
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
    },
    saveIconButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderRadius: 8,
    },
    statsSeparator: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        marginVertical: 15,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#8b4513',
        fontWeight: 'bold',
        marginTop: 5,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 18,
        color: '#3d2b1f',
        fontWeight: 'bold',
        marginTop: 2,
    },
    logoutButton: {
        width: width * 0.9,
        marginBottom: 15,
    },
    backButton: {
        width: width * 0.9,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionCard: {
        width: width * 0.9,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    sectionText: {
        fontSize: 14,
        color: '#5d4037',
        lineHeight: 20,
    },
    settingRow: {
        marginBottom: 12,
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8b4513',
        marginBottom: 5,
    },
    calSelector: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
    },
    calSelectorText: {
        fontSize: 14,
        color: '#3d2b1f',
    },
    calList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.1)',
    },
    calOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
    },
    calOptionSelected: {
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    calOptionText: {
        fontSize: 14,
        color: '#3d2b1f',
    },
});
