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
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, LogOut, Save, Shield, Edit2, Star, Clock } from 'lucide-react-native';
import { useUserStats } from '../hooks/useUserStats';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { profile, loading: statsLoading } = useUserStats();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [isLogin, setIsLogin] = useState(true);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);

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

    const handleSignOut = async () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas abandonar el reino por ahora?",
            [
                { text: "No, me quedo", style: "cancel" },
                {
                    text: "Sí, salir",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) Alert.alert('Error', error.message);
                    }
                }
            ]
        );
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username })
                .eq('id', session?.user?.id);

            if (error) throw error;
            setIsEditingUsername(false);
            Alert.alert('¡Actualizado!', 'Tus pergaminos han sido actualizados.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || statsLoading;

    if (!session) {
        return (
            <View style={styles.container}>
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

                    <MedievalButton
                        title="VOLVER AL MAPA"
                        variant="danger"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>👤 PERFIL DEL HÉROE</Text>

                <ParchmentCard style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <User size={60} color="#d4af37" />
                        </View>
                        <Shield size={24} color="#d4af37" style={styles.shieldIcon} />
                    </View>

                    {/* Rango y Nivel */}
                    <View style={styles.rankBadge}>
                        <Star size={16} color="#d4af37" />
                        <Text style={styles.rankText}>
                            Nvl {profile?.level ?? 1} - {profile?.class ?? 'Aprendiz'}
                        </Text>
                    </View>

                    <View style={styles.infoGroup}>
                        <Text style={styles.infoLabel}>Correo Electrónico:</Text>
                        <Text style={styles.infoValue}>{session.user.email}</Text>
                    </View>

                    <View style={styles.editGroup}>
                        <Text style={styles.infoLabel}>Nombre de Guerrero:</Text>
                        {isEditingUsername ? (
                            <View style={styles.editInputWrapper}>
                                <TextInput
                                    style={styles.profileInput}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Tu nombre aquí..."
                                    autoFocus
                                />
                                <TouchableOpacity
                                    style={styles.saveIconButton}
                                    onPress={handleUpdateProfile}
                                >
                                    <Save size={20} color="#27ae60" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.usernameDisplay}>
                                <Text style={styles.infoValue}>
                                    {profile?.username || "Sin nombre"}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsEditingUsername(true)}
                                    style={styles.editIconButton}
                                >
                                    <Edit2 size={16} color="#8b4513" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Stats de Estudio */}
                    <View style={styles.statsSeparator} />

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

                <MedievalButton
                    title="CERRAR SESIÓN"
                    variant="danger"
                    onPress={handleSignOut}
                    style={styles.logoutButton}
                />

                <MedievalButton
                    title="VOLVER AL MAPA"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
            {isLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#FFD700" />
                </View>
            )}
        </View>
    );
};

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
    profileCard: {
        width: width * 0.9,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
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
    }
});
