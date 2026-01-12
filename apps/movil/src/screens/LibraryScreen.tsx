import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
    AppState,
    AppStateStatus
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen,
    Timer as TimerIcon,
    BookText,
    Plus,
    History,
    CheckCircle,
    ChevronDown,
    Clock,
    Award,
    Shield,
    Compass,
    AlertTriangle
} from 'lucide-react-native';
import { useLibrary } from '../hooks/useLibrary';
import { Subject } from '../types/supabase';

const { width, height } = Dimensions.get('window');

const SUBJECT_COLORS = ['#8b4513', '#2c3e50', '#27ae60', '#8e44ad', '#d35400', '#c0392b', '#16a085'];
const SESSION_STORAGE_KEY = '@omega_active_session';

// Notification Setup
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const LibraryScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        activeSubjects,
        completedSubjects,
        addSubject,
        completeSubject,
        logStudySession,
        loading
    } = useLibrary();

    // UI States
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isSubjectPickerVisible, setIsSubjectPickerVisible] = useState(false);

    // Form States
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);

    // Session Config States
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [studyMode, setStudyMode] = useState<'TIMER' | 'STOPWATCH'>('STOPWATCH');
    const [difficulty, setDifficulty] = useState<'EXPLORER' | 'CRUSADE'>('EXPLORER');
    const [targetMinutes, setTargetMinutes] = useState('25');

    // Active Session States (Synchronized via timestamps)
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef(AppState.currentState);
    const backgroundTimeRef = useRef<number | null>(null);

    // 1. Initial Load & Recovery
    useEffect(() => {
        const loadPersistedSession = async () => {
            const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            if (saved) {
                const sessionData = JSON.parse(saved);
                const start = sessionData.startTime;
                const now = Date.now();
                const elapsed = Math.floor((now - start) / 1000);

                // Set initial states
                setStartTime(start);
                setElapsedSeconds(elapsed);
                setStudyMode(sessionData.mode);
                setDifficulty(sessionData.difficulty);
                setTargetMinutes(sessionData.targetMinutes);

                // Recovery subject match
                const subject = activeSubjects.find(s => s.id === sessionData.subjectId);
                if (subject) setSelectedSubject(subject);

                setIsSessionActive(true);
            }
        };

        if (!loading && activeSubjects.length > 0) {
            loadPersistedSession();
        }

        requestPermissions();
    }, [loading, activeSubjects]);

    // Initial subject selection
    useEffect(() => {
        if (!selectedSubject && activeSubjects.length > 0) {
            setSelectedSubject(activeSubjects[0]);
        }
    }, [activeSubjects]);

    const requestPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            await Notifications.requestPermissionsAsync();
        }
    };

    // 2. Timer Heartbeat (Calculated against absolute startTime)
    useEffect(() => {
        if (isSessionActive && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedSeconds(elapsed);

                // Timer completion notification
                if (studyMode === 'TIMER') {
                    const targetSecs = parseInt(targetMinutes) * 60;
                    if (elapsed === targetSecs) {
                        sendLocalNotification('⌛ ¡Tiempo Cumplido!', 'Has alcanzado tu objetivo de estudio. Puedes finalizar o seguir en overtime.');
                    }
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionActive, startTime, studyMode, targetMinutes]);

    // 3. AppState Detection (Iron Will - Crusade Mode)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isSessionActive, difficulty, startTime]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (!isSessionActive || difficulty !== 'CRUSADE') return;

        if (appState.current.match(/active/) && nextAppState === 'background') {
            backgroundTimeRef.current = Date.now();
            sendLocalNotification('⚠️ ¡VUELVE COBARDE!', 'Tu honor está en juego. Si tardas más de 10 segundos fuera, la sesión fallará.');
        }

        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            if (backgroundTimeRef.current) {
                const diff = (Date.now() - backgroundTimeRef.current) / 1000;
                if (diff > 10) {
                    failSession();
                }
            }
            backgroundTimeRef.current = null;
        }

        appState.current = nextAppState;
    };

    const sendLocalNotification = async (title: string, body: string) => {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: null,
        });
    };

    const failSession = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsSessionActive(false);
        const start = startTime;
        const sub = selectedSubject;
        const mode = studyMode;

        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);

        try {
            await logStudySession({
                subject_id: sub!.id,
                start_time: new Date(start!).toISOString(),
                end_time: new Date().toISOString(),
                duration_minutes: 0,
                mode: mode,
                status: 'ABANDONED',
                difficulty: 'CRUSADE',
                notes: 'Sesión fallida por salir del campo de batalla (Deshonra).'
            });
            Alert.alert(
                '💀 Deshonra',
                'Has huido del campo de batalla. Tu esfuerzo se ha disipado en el éter y tu honor ha sido manchado.',
                [{ text: 'Lamentable', onPress: () => closeSession() }]
            );
        } catch (error: any) {
            console.error(error);
            closeSession();
        }
    };

    // 4. Session Control
    const startSession = async () => {
        if (!selectedSubject) {
            Alert.alert('🧙‍♂️ Sabio consejo', 'Debes elegir un pergamino (asignatura) antes de empezar.');
            return;
        }
        const now = Date.now();
        setElapsedSeconds(0);
        setStartTime(now);
        setIsSessionActive(true);

        // Persist
        const sessionData = {
            startTime: now,
            subjectId: selectedSubject.id,
            mode: studyMode,
            difficulty,
            targetMinutes
        };
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    };

    const handleStopPress = () => {
        const totalMinutes = Math.floor(elapsedSeconds / 60);
        const targetSecs = parseInt(targetMinutes) * 60;

        // Regla de Sesiones Precoces (< 1 min)
        if (elapsedSeconds < 60) {
            Alert.alert(
                '⏳ Sesión Precoz',
                'Las sesiones de menos de un minuto no cuentan en los anales del reino. ¡Aguanta un poco más, soldado!',
                [
                    { text: 'Seguir Estudiando', style: 'cancel' },
                    { text: 'Salir sin Registrar', onPress: () => stopSession(false, true) }
                ]
            );
            return;
        }

        if (studyMode === 'TIMER' && elapsedSeconds < targetSecs) {
            Alert.alert(
                '⚔️ ¿Romper tu Juramento?',
                `Te comprometiste a estudiar ${targetMinutes} minutos y aún faltan ${Math.ceil((targetSecs - elapsedSeconds) / 60)}s. Abandonar ahora manchará tu honor.`,
                [
                    { text: 'Mantener Honor', style: 'cancel' },
                    { text: 'Aceptar Deshonra', onPress: () => stopSession(true) }
                ]
            );
        } else {
            Alert.alert(
                '📜 Finalizar Sesión',
                '¿Deseas registrar esta sesión de estudio en los archivos reales?',
                [
                    { text: 'Seguir Estudiando', style: 'cancel' },
                    { text: 'Registrar', onPress: () => stopSession(false) }
                ]
            );
        }
    };

    const stopSession = async (abandoned = false, skipLog = false) => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (skipLog) {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            closeSession();
            return;
        }

        const totalMinutes = Math.floor(elapsedSeconds / 60);
        const start = startTime;
        const sub = selectedSubject;
        const mode = studyMode;
        const diff = difficulty;

        try {
            await logStudySession({
                subject_id: sub!.id,
                start_time: new Date(start!).toISOString(),
                end_time: new Date().toISOString(),
                duration_minutes: abandoned ? 0 : (totalMinutes || 1),
                mode: mode,
                status: abandoned ? 'ABANDONED' : 'COMPLETED',
                difficulty: diff,
                notes: abandoned ? 'Sesión abandonada voluntariamente' : 'Estudio completado con éxito'
            });

            if (!abandoned) {
                Alert.alert('✨ Misión Cumplida', `Has sumado ${totalMinutes || 1} minutos de conocimiento.`);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            closeSession();
        }
    };

    const closeSession = () => {
        setIsSessionActive(false);
        setElapsedSeconds(0);
        setStartTime(null);
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            await addSubject(newSubjectName, selectedColor);
            setNewSubjectName('');
            setIsAddModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const formatElapsedTime = (seconds: number) => {
        if (studyMode === 'TIMER') {
            const targetSecs = parseInt(targetMinutes) * 60;
            const diff = targetSecs - seconds;

            if (diff >= 0) {
                // Countdown
                const mins = Math.floor(diff / 60);
                const secs = diff % 60;
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                // Overtime (positive display of elapsed extra time)
                const overtime = Math.abs(diff);
                const mins = Math.floor(overtime / 60);
                const secs = overtime % 60;
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        } else {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    const formatTimeDisplay = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    const SubjectCard = ({ item }: { item: Subject }) => (
        <ParchmentCard style={styles.subjectCard}>
            <View style={[styles.colorTab, { backgroundColor: item.color }]} />
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <View style={styles.subjectStats}>
                    <Clock size={12} color="#8b4513" style={{ marginRight: 4 }} />
                    <Text style={styles.subjectTime}>{formatTimeDisplay(item.total_minutes_studied)}</Text>
                </View>
            </View>
            {!item.is_completed && (
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            '🎓 ¿Asignatura Completada?',
                            `¿Confirmas que has adquirido todo el conocimiento de ${item.name}?`,
                            [
                                { text: 'No aún', style: 'cancel' },
                                { text: 'Sí, Completada', onPress: () => completeSubject(item.id) }
                            ]
                        );
                    }}
                    style={styles.completeBtn}
                >
                    <CheckCircle size={24} color="#27ae60" />
                </TouchableOpacity>
            )}
            {item.is_completed && <Award size={24} color="#d4af37" />}
        </ParchmentCard>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>🏛️ LA GRAN BIBLIOTECA</Text>

                {/* EL ATRIL - Configuración */}
                <ParchmentCard style={styles.atrilCard}>
                    <Text style={styles.sectionTitle}>📜 EL ATRIL DE ESTUDIO</Text>

                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setIsSubjectPickerVisible(true)}
                    >
                        <BookOpen size={20} color="#3d2b1f" />
                        <Text style={styles.pickerText}>
                            {selectedSubject ? selectedSubject.name : 'Elegir Asignatura...'}
                        </Text>
                        <ChevronDown size={20} color="#3d2b1f" />
                    </TouchableOpacity>

                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            style={[styles.modeBtn, studyMode === 'STOPWATCH' && styles.modeBtnActive]}
                            onPress={() => setStudyMode('STOPWATCH')}
                        >
                            <History size={18} color={studyMode === 'STOPWATCH' ? '#fff' : '#3d2b1f'} />
                            <Text style={[styles.modeBtnText, studyMode === 'STOPWATCH' && styles.modeBtnTextActive]}>Cronómetro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeBtn, studyMode === 'TIMER' && styles.modeBtnActive]}
                            onPress={() => setStudyMode('TIMER')}
                        >
                            <TimerIcon size={18} color={studyMode === 'TIMER' ? '#fff' : '#3d2b1f'} />
                            <Text style={[styles.modeBtnText, studyMode === 'TIMER' && styles.modeBtnTextActive]}>Temporizador</Text>
                        </TouchableOpacity>
                    </View>

                    {studyMode === 'TIMER' && (
                        <View style={styles.timerInputContainer}>
                            <Text style={styles.timerInputLabel}>Minutos Objetivo:</Text>
                            <TextInput
                                style={styles.timerInput}
                                keyboardType="numeric"
                                value={targetMinutes}
                                onChangeText={setTargetMinutes}
                                maxLength={3}
                            />
                        </View>
                    )}

                    {/* Selector de Dificultad */}
                    <View style={styles.diffContainer}>
                        <TouchableOpacity
                            style={[styles.diffBtn, difficulty === 'EXPLORER' && styles.diffBtnActiveExplorer]}
                            onPress={() => setDifficulty('EXPLORER')}
                        >
                            <Compass size={18} color={difficulty === 'EXPLORER' ? '#fff' : '#27ae60'} />
                            <Text style={[styles.diffBtnText, difficulty === 'EXPLORER' && { color: '#fff' }]}>Explorador</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.diffBtn, difficulty === 'CRUSADE' && styles.diffBtnActiveCrusade]}
                            onPress={() => setDifficulty('CRUSADE')}
                        >
                            <Shield size={18} color={difficulty === 'CRUSADE' ? '#fff' : '#c0392b'} />
                            <Text style={[styles.diffBtnText, difficulty === 'CRUSADE' && { color: '#fff' }]}>Cruzada</Text>
                        </TouchableOpacity>
                    </View>

                    <MedievalButton
                        title="COMENZAR ESTUDIO"
                        onPress={startSession}
                        style={styles.startBtn}
                    />
                </ParchmentCard>

                {/* ESTANTERÍAS */}
                <View style={styles.shelfHeader}>
                    <Text style={styles.shelfTitle}>📚 TUS ESTANTERÍAS</Text>
                    <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
                        <Plus size={24} color="#FFD700" />
                    </TouchableOpacity>
                </View>

                {activeSubjects.length === 0 && !loading && (
                    <Text style={styles.emptyText}>Tus estanterías están vacías. Añade un pergamino para comenzar.</Text>
                )}

                {activeSubjects.map(subject => (
                    <SubjectCard key={subject.id} item={subject} />
                ))}

                {completedSubjects.length > 0 && (
                    <>
                        <Text style={styles.shelfTitleSecondary}>🎓 CONOCIMIENTO ADQUIRIDO</Text>
                        {completedSubjects.map(subject => (
                            <SubjectCard key={subject.id} item={subject} />
                        ))}
                    </>
                )}

                <MedievalButton
                    title="VOLVER AL MAPA"
                    onPress={() => navigation.goBack()}
                    variant="danger"
                    style={styles.backButton}
                />

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* MODAL: Sesión Activa (Iron Will) */}
            <Modal visible={isSessionActive} animationType="slide" transparent={false}>
                <View style={[styles.sessionContainer, { backgroundColor: selectedSubject?.color || '#1a1a1a' }]}>
                    <View style={styles.sessionOverlay}>
                        <View style={styles.sessionHeaderIcon}>
                            {difficulty === 'CRUSADE' ? <Shield size={80} color="#fff" /> : <BookText size={80} color="#fff" opacity={0.3} />}
                        </View>
                        <Text style={styles.sessionSubjectName}>{selectedSubject?.name}</Text>

                        <View style={styles.difficultyBadge}>
                            {difficulty === 'CRUSADE' ? (
                                <View style={styles.crusadeBadge}>
                                    <AlertTriangle size={14} color="#fff" style={{ marginRight: 5 }} />
                                    <Text style={styles.badgeText}>MODO CRUZADA: NO SALIR</Text>
                                </View>
                            ) : (
                                <Text style={styles.sessionMode}>
                                    {studyMode === 'TIMER' ? `Objetivo: ${targetMinutes}m` : 'Explorando saberes...'}
                                </Text>
                            )}
                        </View>

                        <View style={styles.sessionTimerBox}>
                            <Text style={styles.sessionTimeText}>
                                {studyMode === 'TIMER' && elapsedSeconds > parseInt(targetMinutes) * 60 ? '+' : ''}
                                {formatElapsedTime(elapsedSeconds)}
                            </Text>
                        </View>

                        {studyMode === 'TIMER' && elapsedSeconds > parseInt(targetMinutes) * 60 && (
                            <Text style={styles.overtimeText}>✨ ¡Misión Cumplida! Entrando en OVERTIME...</Text>
                        )}

                        <MedievalButton
                            title={
                                studyMode === 'TIMER' && elapsedSeconds < parseInt(targetMinutes) * 60
                                    ? "📜 RENDIRSE"
                                    : "📜 FINALIZAR"
                            }
                            onPress={handleStopPress}
                            variant={
                                (studyMode === 'TIMER' && elapsedSeconds < parseInt(targetMinutes) * 60) || difficulty === 'CRUSADE'
                                    ? "danger"
                                    : "primary"
                            }
                            style={styles.stopBtn}
                        />
                    </View>
                </View>
            </Modal>

            {/* MODALS: Add Subject & Picker */}
            <Modal visible={isAddModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.addModal}>
                        <Text style={styles.modalTitle}>NUEVO PERGAMINO</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nombre de la Asignatura"
                            value={newSubjectName}
                            onChangeText={setNewSubjectName}
                            autoFocus
                        />
                        <View style={styles.colorPalette}>
                            {SUBJECT_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorActive]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>
                        <View style={styles.modalBtns}>
                            <MedievalButton title="AÑADIR" onPress={handleAddSubject} style={{ flex: 1, marginRight: 10 }} />
                            <MedievalButton title="CANCELAR" variant="danger" onPress={() => setIsAddModalVisible(false)} style={{ flex: 1 }} />
                        </View>
                    </ParchmentCard>
                </View>
            </Modal>

            <Modal visible={isSubjectPickerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.pickerModal}>
                        <Text style={styles.modalTitle}>TUS ASIGNATURAS</Text>
                        <FlatList
                            data={activeSubjects}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setSelectedSubject(item);
                                        setIsSubjectPickerVisible(false);
                                    }}
                                >
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.pickerItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>No hay pergaminos activos.</Text>}
                        />
                        <MedievalButton title="CERRAR" variant="danger" onPress={() => setIsSubjectPickerVisible(false)} />
                    </ParchmentCard>
                </View>
            </Modal>
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
    atrilCard: {
        width: width * 0.9,
        padding: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 15,
        textAlign: 'center',
        letterSpacing: 1,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(61,43,31,0.2)',
        marginBottom: 15,
    },
    pickerText: {
        flex: 1,
        fontSize: 16,
        color: '#3d2b1f',
        marginLeft: 10,
        fontWeight: '500',
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(61,43,31,0.1)',
        borderRadius: 8,
        padding: 4,
        marginBottom: 15,
    },
    modeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
    },
    modeBtnActive: {
        backgroundColor: '#3d2b1f',
    },
    modeBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 6,
    },
    modeBtnTextActive: {
        color: '#fff',
    },
    timerInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    timerInputLabel: {
        fontSize: 14,
        color: '#3d2b1f',
        marginRight: 10,
    },
    timerInput: {
        backgroundColor: 'white',
        width: 60,
        height: 40,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        borderWidth: 1,
        borderColor: '#3d2b1f',
    },
    diffContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    diffBtn: {
        flex: 0.48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(61,43,31,0.1)',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    diffBtnActiveExplorer: {
        backgroundColor: '#27ae60',
        borderColor: '#2e7d32',
    },
    diffBtnActiveCrusade: {
        backgroundColor: '#c0392b',
        borderColor: '#b71c1c',
    },
    diffBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
        color: '#3d2b1f',
    },
    startBtn: {
        width: '100%',
    },
    shelfHeader: {
        width: width * 0.9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    shelfTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    shelfTitleSecondary: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 30,
        marginBottom: 15,
        width: '100%',
    },
    emptyText: {
        color: '#aaa',
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 20,
    },
    subjectCard: {
        width: width * 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        overflow: 'hidden',
    },
    colorTab: {
        width: 10,
        height: '150%',
        position: 'absolute',
        left: 0,
    },
    subjectInfo: {
        flex: 1,
        marginLeft: 10,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    subjectStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    subjectTime: {
        fontSize: 12,
        color: '#8b4513',
    },
    completeBtn: {
        padding: 5,
    },
    backButton: {
        width: width * 0.9,
        marginTop: 40,
    },
    sessionContainer: {
        flex: 1,
    },
    sessionOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    sessionHeaderIcon: {
        marginBottom: 20,
    },
    sessionSubjectName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    difficultyBadge: {
        marginTop: 15,
        height: 30,
        justifyContent: 'center',
    },
    crusadeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c0392b',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    sessionMode: {
        fontSize: 16,
        color: '#FFD700',
        fontStyle: 'italic',
    },
    sessionTimerBox: {
        marginVertical: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    sessionTimeText: {
        fontSize: 54,
        color: '#fff',
        fontWeight: '300',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    overtimeText: {
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    stopBtn: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addModal: {
        width: width * 0.85,
        padding: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d2b1f',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#3d2b1f',
        marginBottom: 20,
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 25,
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        margin: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorActive: {
        borderColor: '#FFD700',
        transform: [{ scale: 1.2 }],
    },
    modalBtns: {
        flexDirection: 'row',
    },
    pickerModal: {
        width: width * 0.85,
        maxHeight: height * 0.7,
        padding: 20,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.1)',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
    },
    pickerItemText: {
        fontSize: 18,
        color: '#3d2b1f',
        fontWeight: '500',
    }
});
