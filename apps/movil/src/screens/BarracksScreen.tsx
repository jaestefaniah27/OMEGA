import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { 
    Swords, 
    Shield, 
    Scroll, 
    Timer, 
    Dumbbell, 
    Plus, 
    X, 
    CheckCircle2, 
    ChevronRight, 
    History, 
    Trophy,
    Settings,
    Flame
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- INTERNAL MOCKS ---

const useRoutinesMock = () => {
    const [routines] = useState([
        { id: '1', name: 'Empuje de Gladiador', sets: 12, lastPerformed: 'Hace 2 días' },
        { id: '2', name: 'Tracción Norteña', sets: 15, lastPerformed: 'Hace 5 días' },
        { id: '3', name: 'Pilares del Reino', sets: 10, lastPerformed: 'Ayer' },
    ]);

    const [history] = useState([
        { id: 'h1', date: '14 Ene', routine: 'Empuje de Gladiador', duration: '45m', tonnage: '4,500kg' },
        { id: 'h2', date: '12 Ene', routine: 'Pilares del Reino', duration: '52m', tonnage: '6,200kg' },
        { id: 'h3', date: '10 Ene', routine: 'Tracción Norteña', duration: '40m', tonnage: '3,800kg' },
    ]);

    const [records] = useState([
        { id: 'r1', exercise: 'Press de Banca', weight: '100kg', date: '10 Ene' },
        { id: 'r2', exercise: 'Sentadilla', weight: '140kg', date: '12 Ene' },
        { id: 'r3', exercise: 'Peso Muerto', weight: '180kg', date: '05 Ene' },
    ]);

    return { routines, history, records };
};

const useActiveSessionMock = () => {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [sets, setSets] = useState([
        { id: 's1', exercise: 'Press de Banca', weight: 80, reps: 10, type: 'EFFORT', completed: false },
        { id: 's2', exercise: 'Press de Banca', weight: 80, reps: 9, type: 'EFFORT', completed: false },
        { id: 's3', exercise: 'Aperturas con Mancuerna', weight: 15, reps: 12, type: 'WARMUP', completed: false },
    ]);

    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const toggleSet = (id: string) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const cycleType = (id: string) => {
        const types = ['WARMUP', 'EFFORT', 'FAILURE'];
        setSets(prev => prev.map(s => {
            if (s.id === id) {
                const currentIdx = types.indexOf(s.type);
                const nextType = types[(currentIdx + 1) % types.length];
                return { ...s, type: nextType };
            }
            return s;
        }));
    };

    const addSet = () => {
        const newSet = {
            id: `s${Date.now()}`,
            exercise: 'Nuevo Ejercicio',
            weight: 0,
            reps: 0,
            type: 'EFFORT',
            completed: false
        };
        setSets([...sets, newSet]);
    };

    return { 
        isActive, 
        setIsActive, 
        seconds, 
        formatTime: formatTime(seconds), 
        sets,
        toggleSet,
        cycleType,
        addSet
    };
};

// --- MAIN SCREEN ---

export const BarracksScreen: React.FC = () => {
    const [viewMode, setViewMode] = useState<'PATIO' | 'ESTRATEGIA'>('PATIO');
    const [modalVisible, setModalVisible] = useState(false);
    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
    const { routines, history, records } = useRoutinesMock();
    const { isActive, setIsActive, formatTime, sets, toggleSet, cycleType, addSet } = useActiveSessionMock();

    const handleStartPress = () => {
        setIsActive(true);
        setModalVisible(true);
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'WARMUP': return '#3498db'; // Blue
            case 'EFFORT': return '#e67e22'; // Orange
            case 'FAILURE': return '#c0392b'; // Red
            default: return '#8b4513';
        }
    };

    const getTypeText = (type: string) => {
        switch(type) {
            case 'WARMUP': return 'C';
            case 'EFFORT': return 'E';
            case 'FAILURE': return 'F';
            default: return 'E';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Aesthetic Copy of Theatre/Library */}
            <View style={styles.topHeader}>
                <Text style={styles.headerTitle}>BARRACONES</Text>
                <Text style={styles.headerSubtitle}>"Forjando la voluntad de los campeones"</Text>
            </View>

            {/* Tab Selector with Sliding Indicator */}
            <View style={styles.tabSelector}>
                <Animated.View
                    style={[
                        styles.tabIndicator,
                        {
                            transform: [{
                                translateX: scrollX.interpolate({
                                    inputRange: [0, width],
                                    outputRange: [4, ((width - 38) / 2) + 4]
                                })
                            }],
                            width: (width - 38) / 2
                        }
                    ]}
                />

                <TouchableOpacity
                    style={styles.tabBtn}
                    onPress={() => horizontalScrollRef.current?.scrollTo({ x: 0, animated: true })}
                >
                    <Swords size={18} color={viewMode === 'PATIO' ? '#FFD700' : '#8b4513'} />
                    <Text style={[styles.tabBtnText, { color: viewMode === 'PATIO' ? '#FFD700' : '#8b4513' }]}>PATIO</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabBtn}
                    onPress={() => horizontalScrollRef.current?.scrollTo({ x: width, animated: true })}
                >
                    <Shield size={18} color={viewMode === 'ESTRATEGIA' ? '#FFD700' : '#8b4513'} />
                    <Text style={[styles.tabBtnText, { color: viewMode === 'ESTRATEGIA' ? '#FFD700' : '#8b4513' }]}>ESTRATEGIA</Text>
                </TouchableOpacity>
            </View>

            {/* Swipeable Content */}
            <ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    setViewMode(offsetX >= width / 2 ? 'ESTRATEGIA' : 'PATIO');
                }}
            >
                {/* PATIO DE ARMAS (Action View) */}
                <ScrollView
                    style={{ width }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heroSection}>
                        <View style={styles.heroDecoration}>
                            <Swords size={60} color="rgba(255,215,0,0.1)" />
                        </View>
                        <Text style={styles.heroTitle}>CAMPO DE ENTRENAMIENTO</Text>
                        
                        <View style={styles.routineSelector}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineSelectorContent}>
                                <TouchableOpacity 
                                    style={[styles.routineChip, selectedRoutineId === null && styles.activeRoutineChip]}
                                    onPress={() => setSelectedRoutineId(null)}
                                >
                                    <Text style={[styles.routineChipText, selectedRoutineId === null && styles.activeRoutineChipText]}>MISIÓN LIBRE</Text>
                                </TouchableOpacity>
                                {routines.map(r => (
                                    <TouchableOpacity 
                                        key={r.id}
                                        style={[styles.routineChip, selectedRoutineId === r.id && styles.activeRoutineChip]}
                                        onPress={() => setSelectedRoutineId(r.id)}
                                    >
                                        <Text style={[styles.routineChipText, selectedRoutineId === r.id && styles.activeRoutineChipText]}>{r.name.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <MedievalButton 
                            title={selectedRoutineId ? "INICIAR RUTINA" : "INICIAR COMBATE"}
                            onPress={handleStartPress}
                            style={styles.heroButton}
                        />
                    </View>

                    <ParchmentCard style={styles.strategySection}>
                        <View style={styles.sectionHeader}>
                            <Flame size={18} color="#e67e22" />
                            <Text style={styles.sectionTitle}>FATIGA MUSCULAR</Text>
                        </View>
                        <View style={styles.heatmapMock}>
                            <View style={styles.heatZone}><Text style={styles.heatText}>Pecho: 85%</Text></View>
                            <View style={[styles.heatZone, { opacity: 0.6 }]}><Text style={styles.heatText}>Espalda: 50%</Text></View>
                            <View style={[styles.heatZone, { opacity: 0.2 }]}><Text style={styles.heatText}>Piernas: 15%</Text></View>
                        </View>
                    </ParchmentCard>

                    <View style={styles.sectionHeader}>
                        <History size={18} color="#FFD700" />
                        <Text style={styles.sectionTitle}>ÚLTIMAS BATALLAS</Text>
                    </View>
                    {history.map(item => (
                        <ParchmentCard key={item.id} style={styles.historyCard}>
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyDate}>{item.date}</Text>
                                <Text style={styles.historyRoutine}>{item.routine}</Text>
                            </View>
                            <View style={styles.historyFooter}>
                                <View style={styles.historyMetric}>
                                    <Timer size={12} color="#8b4513" />
                                    <Text style={styles.metricText}>{item.duration}</Text>
                                </View>
                                <View style={styles.historyMetric}>
                                    <Dumbbell size={12} color="#8b4513" />
                                    <Text style={styles.metricText}>{item.tonnage}</Text>
                                </View>
                            </View>
                        </ParchmentCard>
                    ))}
                    {/* Space for HUD */}
                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* SALA DE ESTRATEGIA (Strategy View) */}
                <ScrollView
                    style={{ width }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ParchmentCard style={styles.strategySection}>
                        <View style={styles.sectionHeader}>
                            <Trophy size={18} color="#FFD700" />
                            <Text style={styles.sectionTitle}>RÉCORDS HISTÓRICOS</Text>
                        </View>
                        {records.map(record => (
                            <View key={record.id} style={styles.recordRow}>
                                <Text style={styles.recordExercise}>{record.exercise}</Text>
                                <Text style={styles.recordWeight}>{record.weight}</Text>
                                <Text style={styles.recordDate}>{record.date}</Text>
                            </View>
                        ))}
                    </ParchmentCard>

                    <View style={styles.sectionHeader}>
                        <Scroll size={18} color="#FFD700" />
                        <Text style={styles.sectionTitle}>PLANES DE ATAQUE</Text>
                    </View>
                    {routines.map(r => (
                        <TouchableOpacity key={r.id} style={styles.routineCard}>
                            <View style={styles.routineInfo}>
                                <Text style={styles.routineName}>{r.name}</Text>
                                <Text style={styles.routineDetail}>{r.sets} series • {r.lastPerformed}</Text>
                            </View>
                            <ChevronRight size={20} color="#FFD700" />
                        </TouchableOpacity>
                    ))}
                    {/* Space for HUD */}
                    <View style={{ height: 150 }} />
                </ScrollView>
            </ScrollView>

            {/* IMMERSIVE WORKOUT MODAL */}
            <Modal visible={modalVisible} animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.dummySpace} />
                        <View style={styles.modalTimer}><Timer size={18} color="#FFD700" /><Text style={styles.timerDigits}>{formatTime}</Text></View>
                        <View style={styles.dummySpace} />
                    </View>
                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.modalTitle}>FORJA TÁCTICA</Text>
                        
                        <ParchmentCard style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}><Text style={styles.exerciseTitle}>Press de Banca</Text><Settings size={18} color="#3d2b1f" /></View>
                            <View style={styles.setContainer}>
                                <View style={styles.setLabelRow}>
                                    <Text style={styles.setLabel}>SERIE</Text>
                                    <Text style={styles.setLabel}>KG</Text>
                                    <Text style={styles.setLabel}>REPS</Text>
                                    <Text style={styles.setLabel}>MODO</Text>
                                    <Text style={styles.setLabel}>HECHO</Text>
                                </View>
                                {sets.slice(0, 3).map((s, idx) => (
                                    <View key={s.id} style={[styles.setRow, s.completed && styles.setRowCompleted]}>
                                        <Text style={styles.setNumber}>{idx + 1}</Text>
                                        <TextInput style={styles.setInput} value={s.weight.toString()} keyboardType="numeric" />
                                        <TextInput style={styles.setInput} value={s.reps.toString()} keyboardType="numeric" />
                                        
                                        <TouchableOpacity 
                                            style={[styles.typeToggle, { backgroundColor: getTypeColor(s.type) }]} 
                                            onPress={() => cycleType(s.id)}
                                        >
                                            <Text style={styles.typeToggleText}>{getTypeText(s.type)}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => toggleSet(s.id)}>
                                            <CheckCircle2 size={22} color={s.completed ? '#27ae60' : 'rgba(0,0,0,0.1)'} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                
                                <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                                    <Plus size={14} color="#8b4513" />
                                    <Text style={styles.addSetText}>AÑADIR SERIE</Text>
                                </TouchableOpacity>
                            </View>
                        </ParchmentCard>

                        <MedievalButton 
                            title="AÑADIR EJERCICIO" 
                            variant="primary"
                            onPress={() => {}} 
                            style={{ marginTop: 10, backgroundColor: 'rgba(255,215,0,0.1)' }} 
                        />

                        <MedievalButton title="FINALIZAR BATALLA" onPress={() => { setIsActive(false); setModalVisible(false); }} style={{ marginTop: 30 }} />
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0f0a',
    },
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#1c110b',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#d4af37',
        fontStyle: 'italic',
        marginTop: 4,
        opacity: 0.8,
    },
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: '#2c1a12',
        padding: 4,
        margin: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4d2b1a',
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: '#3d2b1f',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 35,
        backgroundColor: 'rgba(255, 215, 0, 0.03)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
        marginBottom: 25,
        position: 'relative',
        overflow: 'hidden',
    },
    heroDecoration: {
        position: 'absolute',
        top: -15,
        right: -15,
        opacity: 0.2,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2,
        marginBottom: 15,
        textAlign: 'center',
    },
    heroButton: {
        width: width * 0.7,
    },
    routineSelector: {
        width: '100%',
        marginBottom: 20,
    },
    routineSelectorContent: {
        paddingHorizontal: 20,
    },
    routineChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
    },
    activeRoutineChip: {
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderColor: '#FFD700',
    },
    routineChipText: {
        color: 'rgba(255,215,0,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeRoutineChipText: {
        color: '#FFD700',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 5,
    },
    sectionTitle: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 10,
        letterSpacing: 1,
    },
    historyCard: {
        marginBottom: 10,
        padding: 15,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    historyDate: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8b4513',
    },
    historyRoutine: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    historyFooter: {
        flexDirection: 'row',
    },
    historyMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metricText: {
        fontSize: 12,
        color: '#3d2b1f',
        marginLeft: 5,
        fontWeight: '600',
    },
    strategySection: {
        marginBottom: 20,
    },
    heatmapMock: {
        height: 140,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
    },
    heatZone: {
        backgroundColor: '#e67e22',
        padding: 8,
        borderRadius: 4,
        marginBottom: 5,
    },
    heatText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    recordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.1)',
    },
    recordExercise: {
        flex: 2,
        color: '#3d2b1f',
        fontWeight: 'bold',
        fontSize: 14,
    },
    recordWeight: {
        flex: 1,
        color: '#8b4513',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    recordDate: {
        flex: 1,
        color: 'rgba(61,43,31,0.5)',
        fontSize: 11,
        textAlign: 'right',
    },
    routineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,215,0,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.1)',
        marginBottom: 8,
    },
    routineInfo: {
        flex: 1,
    },
    routineName: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    },
    routineDetail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,215,0,0.2)',
    },
    dummySpace: {
        width: 24,
    },
    modalTimer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    timerDigits: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    modalBody: {
        flex: 1,
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 2,
    },
    exerciseCard: {
        marginBottom: 10,
        padding: 15,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.1)',
        paddingBottom: 10,
        marginBottom: 15,
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    setContainer: {
        width: '100%',
    },
    setLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    setLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(61,43,31,0.5)',
        width: 45,
        textAlign: 'center',
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingVertical: 8,
        borderRadius: 5,
        marginBottom: 5,
    },
    setRowCompleted: {
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
    },
    setNumber: {
        width: 45,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#8b4513',
    },
    setInput: {
        width: 45,
        height: 30,
        backgroundColor: '#fff',
        borderRadius: 4,
        textAlign: 'center',
        fontSize: 14,
        color: '#3d2b1f',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    typeToggle: {
        width: 45,
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    typeToggleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.1)',
        borderStyle: 'dashed',
        borderRadius: 5,
    },
    addSetText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8b4513',
        marginLeft: 5,
    }
});
