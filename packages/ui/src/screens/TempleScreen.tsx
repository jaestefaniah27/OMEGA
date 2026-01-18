import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform,
    TextInput,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import { MedievalButton, ParchmentCard, ScreenWrapper } from '..';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Heart, Moon, Sun, Scroll, Flame, Send, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useTemple, PerformanceLogger } from '@omega/logic';
import { RootStackParamList } from '../../../../apps/movil/src/navigation/AppNavigator';

const { width } = Dimensions.get('window');

export const TempleScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [positiveDraft, setPositiveDraft] = useState('');
    const [negativeDraft, setNegativeDraft] = useState('');
    const [sleepHours, setSleepHours] = useState('');

    const {
        positiveThoughts,
        negativeThoughts,
        todaySleep,
        loading,
        addGratitude,
        addWorry,
        unleashWorry,
        registerSleep
    } = useTemple();

    const handleAddPositive = async () => {
        if (!positiveDraft.trim()) return;
        await addGratitude(positiveDraft.trim());
        setPositiveDraft('');
    };

    const handleAddNegative = async () => {
        if (!negativeDraft.trim()) return;
        await addWorry(negativeDraft.trim());
        setNegativeDraft('');
    };

    const handleRegisterSleep = async () => {
        const hours = parseFloat(sleepHours);
        if (isNaN(hours) || hours <= 0) {
            Alert.alert('Error', 'Por favor ingresa un número de horas válido.');
            return;
        }
        await registerSleep(hours);
        setSleepHours('');
        Alert.alert('¡Registrado!', 'Tu descanso ha sido registrado en los anales del tiempo.');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
        <ScreenWrapper background="#1a1a2e">
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>⛪ TEMPLO DE LOS ANCESTROS</Text>

                    {/* BOTÓN ZEN */}
                    <TouchableOpacity
                        style={styles.zenEntry}
                        onPress={() => {
                            PerformanceLogger.setLastInteraction();
                            navigation.navigate('ZenFireplace' as any);
                        }}
                    >
                        <Flame size={24} color="#FF8C00" />
                        <Text style={styles.zenEntryText}>MEDITACIÓN ZEN</Text>
                    </TouchableOpacity>

                    {/* Sección El Altar: Gratitud */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Scroll size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL ALTAR (GRATITUD)</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="¿Por qué estás agradecido hoy?"
                                placeholderTextColor="rgba(61, 43, 31, 0.4)"
                                value={positiveDraft}
                                onChangeText={setPositiveDraft}
                            />
                            <TouchableOpacity onPress={handleAddPositive} style={styles.sendButton}>
                                <Send size={20} color="#3d2b1f" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.gratitudeList}>
                            {positiveThoughts.slice(0, 5).map((t, i) => (
                                <View key={t.id} style={styles.thoughtItem}>
                                    <Text style={styles.gratitudeItem}>• {t.content}</Text>
                                </View>
                            ))}
                        </View>
                    </ParchmentCard>

                    {/* Sección La Forja: Preocupaciones */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Flame size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>LA FORJA (LIBERACIÓN)</Text>
                        </View>
                        <Text style={styles.subTitle}>Entrega tus cargas al fuego:</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="¿Qué te preocupa?"
                                placeholderTextColor="rgba(61, 43, 31, 0.4)"
                                value={negativeDraft}
                                onChangeText={setNegativeDraft}
                            />
                            <TouchableOpacity onPress={handleAddNegative} style={styles.sendButton}>
                                <Send size={20} color="#3d2b1f" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.worryList}>
                            {negativeThoughts.map((t) => (
                                <View key={t.id} style={styles.worryItem}>
                                    <Text style={styles.worryText}>{t.content}</Text>
                                    <TouchableOpacity
                                        onPress={() => unleashWorry(t.id)}
                                        style={styles.unleashButton}
                                    >
                                        <CheckCircle2 size={18} color="#27ae60" />
                                        <Text style={styles.unleashText}>LIBERAR</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {negativeThoughts.length === 0 && (
                                <Text style={styles.emptyText}>Tu espíritu está libre de cargas.</Text>
                            )}
                        </View>
                    </ParchmentCard>

                    {/* Sección La Cripta: Sueño */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Moon size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>LA CRIPTA (REPOSO)</Text>
                        </View>

                        {todaySleep ? (
                            <View style={styles.sleepData}>
                                <Text style={styles.sleepTime}>{todaySleep.hours}h</Text>
                                <Text style={styles.sleepQuality}>Descanso Registrado</Text>
                            </View>
                        ) : (
                            <View style={styles.sleepInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Horas de sueño"
                                    keyboardType="numeric"
                                    value={sleepHours}
                                    onChangeText={setSleepHours}
                                />
                                <TouchableOpacity onPress={handleRegisterSleep} style={styles.registerSleepButton}>
                                    <Text style={styles.registerSleepText}>REGISTRAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ParchmentCard>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    zenEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FF8C00',
        marginBottom: 25,
    },
    zenEntryText: {
        color: '#FF8C00',
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 2,
    },
    sectionCard: {
        width: width * 0.9,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5d4037',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        height: 45,
        color: '#3d2b1f',
        fontSize: 14,
    },
    sendButton: {
        padding: 10,
    },
    gratitudeList: {
        marginTop: 5,
    },
    gratitudeItem: {
        fontSize: 14,
        color: '#5d4037',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    thoughtItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    worryList: {
        marginTop: 5,
    },
    worryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(192, 57, 43, 0.05)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    worryText: {
        flex: 1,
        fontSize: 14,
        color: '#c0392b',
        marginRight: 10,
    },
    unleashButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    unleashText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#27ae60',
        marginLeft: 5,
    },
    emptyText: {
        fontSize: 12,
        color: 'rgba(61, 43, 31, 0.5)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginVertical: 10,
    },
    sleepData: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    sleepTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    sleepQuality: {
        fontSize: 14,
        color: '#27ae60',
        fontWeight: '600',
        marginTop: 2,
    },
    sleepInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerSleepButton: {
        backgroundColor: '#3d2b1f',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10,
    },
    registerSleepText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }
});
