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
    TouchableOpacity,
    Platform
} from 'react-native';
import { MedievalButton, ParchmentCard } from '..';
import { supabase, useGame } from '@omega/logic';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, LogOut, Save, Edit2, Settings, Calendar as CalendarIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CalendarSettings = () => {
    const { calendar } = useGame();
    const [showImportList, setShowImportList] = useState(false);
    const [showExportList, setShowExportList] = useState(false);

    if (!calendar) return null;

    const {
        status,
        requestPermission,
        calendars,
        saveSettings,
        importCalendarId,
        exportCalendarId,
        syncNativeEventsToDecrees,
        isSyncing
    } = calendar;

    const handleGrant = async () => {
        await requestPermission();
    };

    if (status?.status !== 'granted') {
        return (
            <ParchmentCard style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <CalendarIcon size={20} color="#8b4513" />
                    <Text style={styles.sectionTitle}>Sincronización de Calendario</Text>
                </View>
                <Text style={styles.sectionText}>
                    Concede permisos para sincronizar tus exámenes y entrenamientos con el calendario de tu móvil.
                </Text>
                <MedievalButton title="Conceder Permisos" onPress={handleGrant} variant="primary" style={{ marginTop: 10 }} />
            </ParchmentCard>
        );
    }

    const importCalName = calendars.find(c => c.id === importCalendarId)?.title || 'Seleccionar...';
    const exportCalName = calendars.find(c => c.id === exportCalendarId)?.title || 'Seleccionar...';

    return (
        <ParchmentCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CalendarIcon size={20} color="#8b4513" />
                    <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Sincronización</Text>
                </View>
                {isSyncing && <ActivityIndicator color="#8b4513" size="small" />}
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Importar desde:</Text>
                <TouchableOpacity onPress={() => setShowImportList(!showImportList)} style={styles.calSelector}>
                    <Text style={styles.calSelectorText}>{importCalName}</Text>
                </TouchableOpacity>
            </View>
            {showImportList && (
                <View style={styles.calList}>
                    {calendars.map(cal => (
                        <TouchableOpacity
                            key={cal.id}
                            style={[styles.calOption, cal.id === importCalendarId && styles.calOptionSelected]}
                            onPress={() => {
                                saveSettings(cal.id, exportCalendarId);
                                setShowImportList(false);
                            }}
                        >
                            <View style={[styles.colorDot, { backgroundColor: cal.color }]} />
                            <Text style={styles.calOptionText}>{cal.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Exportar a:</Text>
                <TouchableOpacity onPress={() => setShowExportList(!showExportList)} style={styles.calSelector}>
                    <Text style={styles.calSelectorText}>{exportCalName}</Text>
                </TouchableOpacity>
            </View>
            {showExportList && (
                <View style={styles.calList}>
                    {calendars.map(cal => (
                        <TouchableOpacity
                            key={cal.id}
                            style={[styles.calOption, cal.id === exportCalendarId && styles.calOptionSelected]}
                            onPress={() => {
                                saveSettings(importCalendarId, cal.id);
                                setShowExportList(false);
                            }}
                        >
                            <View style={[styles.colorDot, { backgroundColor: cal.color }]} />
                            <Text style={styles.calOptionText}>{cal.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <MedievalButton
                title={isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}
                onPress={syncNativeEventsToDecrees}
                variant="primary"
                style={{ marginTop: 15 }}
                disabled={isSyncing}
            />
        </ParchmentCard>
    );
};

export const SettingsScreen: React.FC = () => {
    const { profile } = useGame();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (profile?.username) {
            setUsername(profile.username);
        }
    }, [profile]);

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

    if (!session) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Settings size={60} color="#FFD700" opacity={0.3} />
                    <Text style={styles.emptyText}>Debes iniciar sesión para ver los ajustes.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>⚙️ AJUSTES DEL REINO</Text>

                <ParchmentCard style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <User size={20} color="#8b4513" />
                        <Text style={styles.sectionTitle}>Cuenta y Guerrero</Text>
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
                </ParchmentCard>

                <CalendarSettings />

                <MedievalButton
                    title="CERRAR SESIÓN"
                    variant="danger"
                    onPress={handleSignOut}
                    style={styles.logoutButton}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
            {loading && (
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
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
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
    emptyText: {
        color: 'rgba(255, 215, 0, 0.5)',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    sectionCard: {
        width: width * 0.9,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    infoGroup: {
        width: '100%',
        marginBottom: 20,
    },
    editGroup: {
        width: '100%',
        marginBottom: 10,
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
    logoutButton: {
        width: width * 0.9,
        marginBottom: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
