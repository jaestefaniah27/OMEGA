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
    Animated,
    DeviceEventEmitter,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MedievalButton } from '../MedievalButton';
import { ParchmentCard } from '../ParchmentCard';
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
    Flame,
    Search,
    ChevronUp,
    ChevronDown,
    Trash2
} from 'lucide-react-native';
import {
    useWorkout,
    useActiveWorkout,
    useExercises,
    useWorkoutTimer,
    useRoutines,
    useUserStats,
    supabase
} from '@omega/logic';
import { MuscleHeatMap } from '../components/MuscleHeatMap';

const { width, height } = Dimensions.get('window');

// --- INTERNAL COMPONENTS ---

interface MedievalNumericInputProps {
    value: number;
    onChange: (val: number) => void;
    step?: number;
    min?: number;
}

const MedievalNumericInput: React.FC<MedievalNumericInputProps> = ({ value, onChange, step = 1, min = 1 }) => {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleTextChange = (v: string) => {
        const clean = v.replace(',', '.');
        setInputValue(clean);
        const parsed = parseFloat(clean);
        if (!isNaN(parsed)) {
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        if (inputValue === '' || isNaN(parseFloat(inputValue))) {
            setInputValue(value.toString());
        }
    };

    return (
        <View style={numericStyles.container}>
            <TouchableOpacity
                style={numericStyles.btn}
                onPress={() => onChange(Math.max(min, value - step))}
            >
                <ChevronDown size={20} color="#8b4513" />
            </TouchableOpacity>

            <TextInput
                style={numericStyles.input}
                value={inputValue}
                keyboardType="numeric"
                onChangeText={handleTextChange}
                onBlur={handleBlur}
            />

            <TouchableOpacity
                style={numericStyles.btn}
                onPress={() => onChange(value + step)}
            >
                <ChevronUp size={20} color="#8b4513" />
            </TouchableOpacity>
        </View>
    );
};

const numericStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        height: 40,
        overflow: 'hidden'
    },
    btn: {
        width: 30,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
    },
    input: {
        width: 40,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3d2b1f',
        padding: 0,
    }
});

// --- MAIN SCREEN ---

export const BarracksScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const [viewMode, setViewMode] = useState<'PATIO' | 'ESTRATEGIA'>('PATIO');
    const [modalVisible, setModalVisible] = useState(false);
    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

    const { routines, history, createRoutine, refreshHistory, addExerciseToRoutine, removeExerciseFromRoutine, updateRoutineExercise } = useRoutines();
    const { muscleFatigue, records } = useUserStats();
    const { isSessionActive, setsLog, startSession, finishSession, addSet, updateSet, removeSet } = useWorkout();
    const { formatTime } = useWorkoutTimer();

    const [exerciseSearchVisible, setExerciseSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchMode, setSearchMode] = useState<'WORKOUT' | 'ROUTINE'>('WORKOUT');

    // Routine Creation/Detail States
    const [createRoutineVisible, setCreateRoutineVisible] = useState(false);
    const [newRoutineName, setNewRoutineName] = useState('');
    const [newRoutineCategory, setNewRoutineCategory] = useState('');
    const [detailRoutineId, setDetailRoutineId] = useState<string | null>(null);
    const selectedDetailRoutine = routines.find(r => r.id === detailRoutineId);
    const [epicBattleStatus, setEpicBattleStatus] = useState('');

    const EPIC_QUOTES = [
        "FORJANDO LEYENDA",
        "ACERO Y SANGRE",
        "VOLUNTAD DE HIERRO",
        "CAMINO AL VALHALLA",
        "LATIDO GUERRERO",
        "FORJANDO AL TITÁN",
        "NÉMESIS DEL LÍMITE",
        "SUDOR Y GLORIA"
    ];

    useEffect(() => {
        setModalVisible(isSessionActive);
        if (isSessionActive && !epicBattleStatus) {
            setEpicBattleStatus(EPIC_QUOTES[Math.floor(Math.random() * EPIC_QUOTES.length)]);
        } else if (!isSessionActive) {
            setEpicBattleStatus('');
        }
    }, [isSessionActive]);

    useEffect(() => {
        if (route.params?.routineId && routines.length > 0) {
            const routine = routines.find(r => r.id === route.params.routineId);
            if (routine) {
                setSelectedRoutineId(routine.id);
                // Ensure we are in PATIO view to see the start button
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
            }
        }
    }, [route.params?.routineId, routines]);

    // HUD QuickAdd Listener
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_QUICK_ADD', () => {
            if (detailRoutineId) {
                setSearchMode('ROUTINE');
                setExerciseSearchVisible(true);
            } else if (modalVisible) {
                setSearchMode('WORKOUT');
                setExerciseSearchVisible(true);
            } else if (viewMode === 'ESTRATEGIA') {
                setCreateRoutineVisible(true);
            }
        });
        return () => sub.remove();
    }, [viewMode, detailRoutineId, modalVisible]);

    const handleStartPress = async () => {
        const routine = routines.find(r => r.id === selectedRoutineId);
        await startSession(selectedRoutineId, routine?.exercises || []);
        setModalVisible(true);
    };

    const handleFinishBattle = async () => {
        const success = await finishSession();
        if (success) {
            refreshHistory();
        }
    };

    const handleSearchExercise = async (text: string) => {
        setSearchText(text);
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }
        const { data } = await supabase
            .from('exercises')
            .select('id, name, name_es')
            .or(`name.ilike.%${text}%,name_es.ilike.%${text}%`)
            .limit(10);
        setSearchResults(data || []);
    };

    const handleSelectExercise = async (ex: any) => {
        if (searchMode === 'WORKOUT') {
            addSet(ex.id, ex.name_es || ex.name);
        } else if (searchMode === 'ROUTINE' && detailRoutineId) {
            const currentExCount = selectedDetailRoutine?.exercises?.length || 0;
            await addExerciseToRoutine(detailRoutineId, ex.id, currentExCount);
        }
        setExerciseSearchVisible(false);
        setSearchText('');
        setSearchResults([]);
    };

    const handleCreateRoutine = async () => {
        if (!newRoutineName.trim()) return;
        try {
            await createRoutine(newRoutineName.trim(), newRoutineCategory.trim());
            setNewRoutineName('');
            setNewRoutineCategory('');
            setCreateRoutineVisible(false);
            Alert.alert("Plan Forjado", `La rutina "${newRoutineName}" ha sido añadida a la Sala de Estrategia.`);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'warmup': return '#3498db'; // Blue
            case 'normal': return '#e67e22'; // Orange
            case 'failure': return '#c0392b'; // Red
            default: return '#8b4513';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'warmup': return 'C';
            case 'normal': return 'E';
            case 'failure': return 'F';
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
                        <View style={styles.heatmapBox}>
                            <MuscleHeatMap fatigue={muscleFatigue} />
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
                        {records.map((record: any) => (
                            <View key={record.exercise_id} style={styles.recordRow}>
                                <Text style={styles.recordExercise}>{record.exercise_name}</Text>
                                <Text style={styles.recordWeight}>{record.max_weight}kg</Text>
                                <Text style={styles.recordDate}>{new Date(record.achieved_at).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </ParchmentCard>

                    <View style={styles.sectionHeader}>
                        <Scroll size={18} color="#FFD700" />
                        <Text style={styles.sectionTitle}>PLANES DE ATAQUE</Text>
                    </View>
                    {routines.map(r => (
                        <TouchableOpacity
                            key={r.id}
                            style={styles.routineCard}
                            onPress={() => setDetailRoutineId(r.id)}
                        >
                            <View style={styles.routineInfo}>
                                <Text style={styles.routineName}>{r.name}</Text>
                                {r.category && <Text style={styles.routineCategoryTag}>{r.category.toUpperCase()}</Text>}
                                <Text style={styles.routineDetail}>{r.exercises?.length || 0} habilidades registradas</Text>
                            </View>
                            <ChevronRight size={20} color="#FFD700" />
                        </TouchableOpacity>
                    ))}
                    {/* Space for HUD */}
                    <View style={{ height: 150 }} />
                </ScrollView>
            </ScrollView>

            {/* IMMERSIVE WORKOUT VIEW */}
            {modalVisible && (
                <View style={[styles.absoluteFullScreen, { backgroundColor: '#1a0f0a', zIndex: 1500 }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.epicStatusText}>{epicBattleStatus}</Text>
                            </View>
                            <View style={styles.modalTimer}><Timer size={18} color="#FFD700" /><Text style={styles.timerDigits}>{formatTime}</Text></View>
                            <View style={{ flex: 1 }} />
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalTitle}>FORJA TÁCTICA</Text>

                            {(() => {
                                const exercises: { id: string, name: string, sets: any[] }[] = [];
                                setsLog.forEach(s => {
                                    let ex = exercises.find(e => e.id === s.exercise_id);
                                    if (!ex) {
                                        ex = { id: s.exercise_id, name: s.exercise_name, sets: [] };
                                        exercises.push(ex);
                                    }
                                    ex.sets.push(s);
                                });

                                return exercises.map(ex => (
                                    <ParchmentCard key={ex.id} style={styles.exerciseCard}>
                                        <View style={styles.exerciseHeader}>
                                            <Text style={styles.exerciseTitle}>{ex.name}</Text>
                                            <TouchableOpacity onPress={() => {
                                                // Optional exercise settings
                                            }}>
                                                <Settings size={18} color="#3d2b1f" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.setContainer}>
                                            <View style={styles.setLabelRow}>
                                                <Text style={styles.compShortLabel}>SET</Text>
                                                <Text style={[styles.compShortLabel, { flex: 2 }]}>REPS</Text>
                                                <Text style={[styles.compShortLabel, { flex: 2 }]}>KG</Text>
                                                <Text style={styles.compShortLabel}>TIPO</Text>
                                                <Text style={styles.compShortLabel}>OK</Text>
                                            </View>

                                            {ex.sets.map((s, sIdx) => (
                                                <View key={s.id} style={[styles.setRow, s.completed && styles.setRowCompleted]}>
                                                    <Text style={styles.setNumberCompact}>{sIdx + 1}</Text>

                                                    <View style={{ flex: 2, alignItems: 'center' }}>
                                                        <MedievalNumericInput
                                                            value={s.reps}
                                                            onChange={(v) => updateSet(s.id, { reps: v })}
                                                            step={1}
                                                        />
                                                    </View>

                                                    <View style={{ flex: 2, alignItems: 'center' }}>
                                                        <MedievalNumericInput
                                                            value={s.weight}
                                                            onChange={(v) => updateSet(s.id, { weight: v })}
                                                            step={2.5}
                                                        />
                                                    </View>

                                                    <TouchableOpacity
                                                        style={[styles.typeToggleCompact, { backgroundColor: getTypeColor(s.type) }]}
                                                        onPress={() => {
                                                            const types = ['warmup', 'normal', 'failure'];
                                                            const next = types[(types.indexOf(s.type) + 1) % 3] as any;
                                                            updateSet(s.id, { type: next });
                                                        }}
                                                    >
                                                        <Text style={styles.typeToggleText}>{getTypeText(s.type)}</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity onPress={() => updateSet(s.id, { completed: !s.completed })}>
                                                        <CheckCircle2 size={24} color={s.completed ? '#27ae60' : 'rgba(0,0,0,0.1)'} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}

                                            <TouchableOpacity
                                                style={styles.addSetButton}
                                                onPress={() => addSet(ex.id, ex.name)}
                                            >
                                                <Plus size={14} color="#8b4513" />
                                                <Text style={styles.addSetText}>AÑADIR SERIE</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ParchmentCard>
                                ));
                            })()}

                            <MedievalButton title="FINALIZAR BATALLA" onPress={handleFinishBattle} style={{ marginTop: 30 }} />
                            <View style={{ height: 50 }} />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            )}

            {/* Exercise Selector View */}
            {exerciseSearchVisible && (
                <View style={[styles.absoluteOverlay, { zIndex: 2000 }]}>
                    <TouchableOpacity
                        style={styles.overlayDismiss}
                        activeOpacity={1}
                        onPress={() => setExerciseSearchVisible(false)}
                    />
                    <ParchmentCard style={styles.searchContainer}>
                        <View style={styles.searchHeader}>
                            <Search size={20} color="#3d2b1f" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar ejercicio..."
                                placeholderTextColor="rgba(61,43,31,0.4)"
                                value={searchText}
                                onChangeText={handleSearchExercise}
                                autoFocus
                            />
                            <TouchableOpacity onPress={() => setExerciseSearchVisible(false)}>
                                <X size={20} color="#3d2b1f" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.resultsList}>
                            {searchResults.map(ex => (
                                <TouchableOpacity
                                    key={ex.id}
                                    style={styles.resultItem}
                                    onPress={() => handleSelectExercise(ex)}
                                >
                                    <Text style={styles.resultText}>{ex.name_es || ex.name}</Text>
                                    <Plus size={16} color="#8b4513" />
                                </TouchableOpacity>
                            ))}
                            {searchText.length > 1 && searchResults.length === 0 && (
                                <Text style={styles.noResultsText}>No se encontraron ejercicios</Text>
                            )}
                        </ScrollView>
                    </ParchmentCard>
                </View>
            )}

            {/* Routine Creation View */}
            {createRoutineVisible && (
                <View style={styles.absoluteOverlay}>
                    <TouchableOpacity
                        style={styles.overlayDismiss}
                        activeOpacity={1}
                        onPress={() => setCreateRoutineVisible(false)}
                    />
                    <ParchmentCard style={styles.createRoutineContainer}>
                        <Text style={styles.modalTitleDark}>NUEVO PLAN DE ATAQUE</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>NOMBRE DE LA RUTINA</Text>
                            <TextInput
                                style={styles.medievalInput}
                                placeholder="E.j. Empuje de Titán"
                                placeholderTextColor="rgba(61,43,31,0.4)"
                                value={newRoutineName}
                                onChangeText={setNewRoutineName}
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>SAGA / PROGRAMA (OPCIONAL)</Text>
                            <TextInput
                                style={styles.medievalInput}
                                placeholder="E.j. PPL, Bro Split, Arnold..."
                                placeholderTextColor="rgba(61,43,31,0.4)"
                                value={newRoutineCategory}
                                onChangeText={setNewRoutineCategory}
                            />
                        </View>

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.cancelActionBtn}
                                onPress={() => setCreateRoutineVisible(false)}
                            >
                                <Text style={styles.cancelActionText}>DESCARTAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmActionBtn}
                                onPress={handleCreateRoutine}
                            >
                                <Text style={styles.confirmActionText}>FORJAR PLAN</Text>
                            </TouchableOpacity>
                        </View>
                    </ParchmentCard>
                </View>
            )}

            {/* Routine Detail View */}
            {!!detailRoutineId && (
                <View style={[styles.absoluteFullScreen, { backgroundColor: '#1a0f0a' }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setDetailRoutineId(null)}>
                            <X size={24} color="#FFD700" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.headerTitleSmall}>{selectedDetailRoutine?.name.toUpperCase()}</Text>
                            {selectedDetailRoutine?.category && <Text style={[styles.routineCategoryTag, { color: 'rgba(255,215,0,0.6)', marginTop: 2 }]}>{selectedDetailRoutine.category.toUpperCase()}</Text>}
                        </View>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.modalTitle}>SALA DE MEJORA</Text>

                        {selectedDetailRoutine?.exercises?.map((re: any) => (
                            <ParchmentCard key={re.id} style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <View>
                                        <Text style={styles.exerciseTitle}>{re.exercise?.name_es || re.exercise?.name}</Text>
                                        <Text style={styles.exerciseSubtitle}>{re.exercise?.category}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeExerciseFromRoutine(re.id)}>
                                        <Trash2 size={20} color="#c0392b" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.routineSettingsRow}>
                                    <View style={styles.settingItem}>
                                        <Text style={styles.stepperLabelMini}>REPS OBJETIVO</Text>
                                        <MedievalNumericInput
                                            value={re.target_reps}
                                            onChange={(v) => updateRoutineExercise(re.id, { target_reps: v })}
                                        />
                                    </View>
                                    <View style={styles.settingItem}>
                                        <Text style={styles.stepperLabelMini}>SERIES OBJETIVO</Text>
                                        <MedievalNumericInput
                                            value={re.target_sets}
                                            onChange={(v) => updateRoutineExercise(re.id, { target_sets: v })}
                                        />
                                    </View>
                                </View>
                            </ParchmentCard>
                        ))}

                        <View style={{ height: 150 }} />
                    </ScrollView>
                </View>
            )}
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
        fontSize: 16,
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
    heatmapBox: {
        height: 140,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 12,
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
        fontSize: 18,
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
    },
    exerciseHeaderMini: {
        paddingTop: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.05)',
        marginBottom: 8,
    },
    exerciseTitleMini: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8b4513',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    searchOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    searchContainer: {
        maxHeight: '70%',
        padding: 15,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.2)',
        paddingBottom: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 16,
        color: '#3d2b1f',
    },
    resultsList: {
        minHeight: 100,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.05)',
    },
    resultText: {
        fontSize: 15,
        color: '#3d2b1f',
        fontWeight: '500',
    },
    noResultsText: {
        textAlign: 'center',
        color: 'rgba(61,43,31,0.5)',
        marginTop: 20,
        fontStyle: 'italic',
    },
    createRoutineContainer: {
        padding: 20,
    },
    modalTitleDark: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 8,
        letterSpacing: 1,
    },
    medievalInput: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
        borderRadius: 8,
        padding: 12,
        color: '#3d2b1f',
        fontSize: 16,
    },
    modalActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelActionBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelActionText: {
        color: '#8b4513',
        fontWeight: 'bold',
        fontSize: 12,
    },
    confirmActionBtn: {
        flex: 2,
        backgroundColor: '#3d2b1f',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    confirmActionText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    headerTitleSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 1,
    },
    epicStatusText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: 'rgba(255,215,0,0.4)',
        letterSpacing: 1,
    },
    routineCategoryTag: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#e67e22',
        letterSpacing: 0.5,
    },
    exerciseSubtitle: {
        fontSize: 11,
        color: 'rgba(61,43,31,0.6)',
        fontStyle: 'italic',
    },
    routineSettingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
    },
    settingItem: {
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: 'rgba(61,43,31,0.5)',
        marginBottom: 5,
    },
    stepperWithLabel: {
        alignItems: 'center',
    },
    stepperLabelMini: {
        fontSize: 7,
        fontWeight: 'bold',
        color: 'rgba(61,43,31,0.4)',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    compShortLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: 'rgba(61,43,31,0.4)',
        textAlign: 'center',
        flex: 1,
    },
    setNumberCompact: {
        width: 30,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#8b4513',
        fontSize: 12,
    },
    typeToggleCompact: {
        width: 30,
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    absoluteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
        zIndex: 10000,
    },
    overlayDismiss: {
        ...StyleSheet.absoluteFillObject,
    },
    absoluteFullScreen: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        paddingBottom: 90, // Space for HUD
    }
});
