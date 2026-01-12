import React, { useState, useRef, useEffect } from 'react';
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
    Animated,
    DeviceEventEmitter
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen,
    Timer as TimerIcon,
    BookText,
    History,
    CheckCircle,
    ChevronDown,
    Clock,
    Award,
    Shield,
    Compass,
    AlertTriangle,
    Sword,
    Scroll,
    Map,
    Camera,
    Palette
} from 'lucide-react-native';
import { CameraColorPicker, ManualColorPicker } from '@omega/ui';
import { useLibrary } from '../hooks/useLibrary';
import { Subject, Book } from '../types/supabase';

const { width, height } = Dimensions.get('window');

const SUBJECT_COLORS = ['#8b4513', '#2c3e50', '#27ae60', '#8e44ad', '#d35400', '#c0392b', '#16a085'];
const BOOK_COLORS = ['#8b4513', '#2c3e50', '#27ae60', '#8e44ad', '#d35400', '#c0392b', '#16a085'];

const AnimatedSword = Animated.createAnimatedComponent(Sword);
const AnimatedScroll = Animated.createAnimatedComponent(Scroll);

const toRoman = (num: number): string => {
    if (!num || isNaN(num)) return '';
    const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    let n = num;
    for (const i in lookup) {
        while (n >= lookup[i]) {
            roman += i;
            n -= lookup[i];
        }
    }
    return roman;
};

export const LibraryScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        subjects,
        activeSubjects,
        completedSubjects,
        addSubject,
        completeSubject,
        reactivateSubject,
        isSessionActive,
        startTime,
        elapsedSeconds,
        selectedSubject,
        setSelectedSubject,
        selectedBook,
        setSelectedBook,
        studyMode,
        setStudyMode,
        difficulty,
        setDifficulty,
        startSession,
        stopSession,
        targetMinutes,
        setTargetMinutes,
        loading,
        books,
        activeBooks,
        finishedBooks,
        addBook,
        updateBookProgress,
        completeBook,
        reactivateBook,
        bookStats,
        saveCustomColor,
        customColors
    } = useLibrary();

    // UI-only States
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubjectPickerVisible, setIsSubjectPickerVisible] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCourse, setNewSubjectCourse] = useState('');
    const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);

    // NEW: Dual Mode States
    const [viewMode, setViewMode] = useState<'STUDY' | 'READING'>('STUDY');
    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const [isAddBookVisible, setIsAddBookVisible] = useState(false);
    const [isBookPickerVisible, setIsBookPickerVisible] = useState(false);
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [newBookSaga, setNewBookSaga] = useState('');
    const [newBookSagaIndex, setNewBookSagaIndex] = useState('');
    const [newBookTotalPages, setNewBookTotalPages] = useState('');
    const [newBookCoverColor, setNewBookCoverColor] = useState(BOOK_COLORS[0]);
    const [isReadingStopModalVisible, setIsReadingStopModalVisible] = useState(false);
    const [endPageInput, setEndPageInput] = useState('');

    const [isCameraPickerVisible, setIsCameraPickerVisible] = useState(false);
    const [isManualPickerVisible, setIsManualPickerVisible] = useState(false);
    const [colorPickerTarget, setColorPickerTarget] = useState<'SUBJECT' | 'BOOK' | null>(null);

    // Effect to set default course from most recent subject
    useEffect(() => {
        if (isAddModalVisible && !newSubjectName && !newSubjectCourse && subjects.length > 0) {
            const lastCourse = subjects[0]?.course;
            if (lastCourse) {
                setNewSubjectCourse(lastCourse);
            }
        }
    }, [isAddModalVisible, subjects]);

    // --- QUICK ADD HUD LISTENER ---
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_QUICK_ADD', () => {
            if (viewMode === 'STUDY') {
                setIsAddModalVisible(true);
            } else if (viewMode === 'READING') {
                setIsAddBookVisible(true);
            }
        });
        return () => sub.remove();
    }, [viewMode]);

    // --- HANDLERS: SUBJECTS ---
    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            await addSubject(newSubjectName.trim(), selectedColor, newSubjectCourse.trim() || undefined);
            setNewSubjectName('');
            setNewSubjectCourse('');
            setIsAddModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    // --- HANDLERS: BOOKS ---
    const handleAddBook = async () => {
        if (!newBookTitle.trim() || !newBookTotalPages.trim() || isNaN(Number(newBookTotalPages))) {
            Alert.alert('Error', 'Por favor, introduce un título y un número de páginas válido.');
            return;
        }
        try {
            const sagaIdx = newBookSagaIndex ? parseInt(newBookSagaIndex) : undefined;
            await addBook(
                newBookTitle.trim(),
                newBookAuthor.trim() || 'Desconocido',
                parseInt(newBookTotalPages),
                newBookCoverColor,
                newBookSaga.trim() || undefined,
                sagaIdx
            );
            setNewBookTitle('');
            setNewBookAuthor('');
            setNewBookSaga('');
            setNewBookSagaIndex('');
            setNewBookTotalPages('');
            setIsAddBookVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleStartReading = () => {
        if (!selectedBook) {
            Alert.alert('Atención', 'Selecciona un tomo para leer.');
            return;
        }
        startSession('BOOK');
    };

    const handleStopReadingPress = () => {
        setIsReadingStopModalVisible(true);
        // Default to current page + some guess? No, just current.
        setEndPageInput(selectedBook?.current_page.toString() || '0');
    };

    const confirmStopReading = async () => {
        const page = parseInt(endPageInput);
        if (isNaN(page)) {
            Alert.alert('Error', 'Página inválida.');
            return;
        }
        await stopSession(false, false, page);
        setIsReadingStopModalVisible(false);
    };


    // --- FORMATTERS ---
    const formatElapsedTime = (seconds: number) => {
        if (studyMode === 'TIMER' && viewMode === 'STUDY') {
            const targetSecs = parseInt(targetMinutes) * 60;
            const diff = targetSecs - seconds;

            if (diff >= 0) {
                const mins = Math.floor(diff / 60);
                const secs = diff % 60;
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
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

    // --- HANDLERS: SESSION ---
    const handleStartStudyPress = async () => {
        if (!selectedSubject) {
            Alert.alert('¡Alto ahí!', 'Debes seleccionar un pergamino (asignatura) antes de comenzar.');
            return;
        }
        await startSession('SUBJECT');
    };

    const handleStopStudyPress = () => {
        const targetSecs = parseInt(targetMinutes) * 60;

        if (elapsedSeconds < 60) {
            Alert.alert(
                '⏳ Sesión Precoz',
                'Las sesiones de menos de un minuto no cuentan. ¡Aguanta un poco más!',
                [
                    { text: 'Seguir', style: 'cancel' },
                    { text: 'Salir sin Registrar', onPress: () => stopSession(false, true) }
                ]
            );
            return;
        }

        if (studyMode === 'TIMER' && elapsedSeconds < targetSecs) {
            Alert.alert(
                '⚔️ ¿Romper tu Juramento?',
                `Te faltan ${Math.ceil((targetSecs - elapsedSeconds) / 60)} min. ¿Abandonar?`,
                [
                    { text: 'Mantener Honor', style: 'cancel' },
                    { text: 'Aceptar Deshonra', onPress: () => stopSession(true) }
                ]
            );
        } else {
            Alert.alert(
                '📜 Finalizar Sesión',
                '¿Registrar sesión en los archivos?',
                [
                    { text: 'Seguir', style: 'cancel' },
                    { text: 'Registrar', onPress: () => stopSession(false) }
                ]
            );
        }
    };

    // --- CARDS ---
    const SubjectCard = ({ item }: { item: Subject }) => (
        <ParchmentCard style={styles.subjectCard}>
            <View style={[styles.colorTab, { backgroundColor: item.color }]} />
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <View style={styles.subjectMetaRow}>
                    {item.course && (
                        <View style={styles.courseBadge}>
                            <Map size={10} color="#8b4513" style={{ marginRight: 3 }} />
                            <Text style={styles.courseText}>{item.course}</Text>
                        </View>
                    )}
                    <View style={styles.subjectStats}>
                        <Clock size={12} color="#8b4513" style={{ marginRight: 4 }} />
                        <Text style={styles.subjectTime}>{formatTimeDisplay(item.total_minutes_studied)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.cardActions}>
                {item.is_completed ? (
                    <TouchableOpacity
                        style={styles.reactivateBtn}
                        onPress={() => reactivateSubject(item.id)}
                    >
                        <History size={20} color="#8b4513" opacity={0.6} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => completeSubject(item.id)}
                    >
                        <CheckCircle size={20} color="#27ae60" />
                    </TouchableOpacity>
                )}
            </View>
        </ParchmentCard>
    );

    const BookCard = ({ item }: { item: Book }) => (
        <ParchmentCard style={styles.subjectCard}>
            <View style={[styles.colorTab, { backgroundColor: item.cover_color || '#8b4513' }]} />
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>
                    {item.title}
                    {item.saga ? ` - ${item.saga} ${toRoman(item.saga_index || 0)}` : ''}
                </Text>
                <View style={styles.subjectMetaRow}>
                    <Text style={styles.courseText}>{item.author || "Anónimo"}</Text>
                </View>
                {/* Book Progress */}
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${Math.min(100, (item.current_page / item.total_pages) * 100)}%` }
                        ]}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={styles.progressText}>
                        {Math.round((item.current_page / (item.total_pages || 1)) * 100)}% ({item.current_page}/{item.total_pages})
                    </Text>
                    {bookStats[item.id] > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={10} color="#8b4513" style={{ marginRight: 2 }} />
                            <Text style={[styles.progressText, { marginTop: 0 }]}>
                                {formatTimeDisplay(bookStats[item.id] || 0)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.cardActions}>
                {item.is_finished ? (
                    <TouchableOpacity
                        style={styles.reactivateBtn}
                        onPress={() => reactivateBook(item.id)}
                    >
                        <History size={20} color="#8b4513" opacity={0.6} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => completeBook(item.id)}
                    >
                        <CheckCircle size={20} color="#27ae60" />
                    </TouchableOpacity>
                )}
            </View>
        </ParchmentCard>
    );

    // --- VIEWS ---
    const StudyView = () => (
        <>


            <ParchmentCard style={styles.atrilCard}>
                <View style={styles.atrilHeader}>
                    <Award size={24} color="#8b4513" />
                    <Text style={styles.atrilTitle}>ATRIL DE ESTUDIO</Text>
                </View>

                <TouchableOpacity
                    style={styles.subjectSelector}
                    onPress={() => setIsSubjectPickerVisible(true)}
                >
                    <View style={styles.subjectSelectorLeft}>
                        <BookText size={20} color="#8b4513" />
                        <Text style={styles.subjectSelectorText}>
                            {selectedSubject ? selectedSubject.name : 'Seleccionar Asignatura'}
                        </Text>
                    </View>
                    <ChevronDown size={20} color="#8b4513" />
                </TouchableOpacity>

                <View style={styles.modeTabs}>
                    <TouchableOpacity
                        style={[styles.modeTab, studyMode === 'STOPWATCH' && styles.activeModeTab]}
                        onPress={() => setStudyMode('STOPWATCH')}
                    >
                        <History size={18} color={studyMode === 'STOPWATCH' ? '#fff' : '#8b4513'} />
                        <Text style={[styles.modeTabText, studyMode === 'STOPWATCH' && styles.activeModeTabText]}>Cronómetro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeTab, studyMode === 'TIMER' && styles.activeModeTab]}
                        onPress={() => setStudyMode('TIMER')}
                    >
                        <TimerIcon size={18} color={studyMode === 'TIMER' ? '#fff' : '#8b4513'} />
                        <Text style={[styles.modeTabText, studyMode === 'TIMER' && styles.activeModeTabText]}>Temporizador</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.difficultyContainer}>
                    <Text style={styles.diffLabel}>DIFICULTAD:</Text>
                    <View style={styles.diffGroup}>
                        <TouchableOpacity
                            style={[styles.diffBtn, difficulty === 'EXPLORER' && styles.diffActiveExplorer]}
                            onPress={() => setDifficulty('EXPLORER')}
                        >
                            <Compass size={14} color={difficulty === 'EXPLORER' ? '#fff' : '#8b4513'} />
                            <Text style={[styles.diffBtnText, difficulty === 'EXPLORER' && styles.textWhite]}>Explorador</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.diffBtn, difficulty === 'CRUSADE' && styles.diffActiveCrusade]}
                            onPress={() => setDifficulty('CRUSADE')}
                        >
                            <Shield size={14} color={difficulty === 'CRUSADE' ? '#fff' : '#8b4513'} />
                            <Text style={[styles.diffBtnText, difficulty === 'CRUSADE' && styles.textWhite]}>Cruzada</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {studyMode === 'TIMER' && (
                    <View style={styles.timerConfig}>
                        <Clock size={16} color="#8b4513" />
                        <TextInput
                            style={styles.minutesInput}
                            value={targetMinutes}
                            onChangeText={setTargetMinutes}
                            keyboardType="number-pad"
                            maxLength={3}
                        />
                        <Text style={styles.minutesLabel}>min.</Text>
                    </View>
                )}

                <MedievalButton
                    title="INICIAR MISIÓN"
                    onPress={handleStartStudyPress}
                    disabled={isSessionActive}
                    style={styles.startBtn}
                />
            </ParchmentCard>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📜 ARTES MÍSTICAS POR DOMINAR</Text>
            </View>

            {activeSubjects.length === 0 && !loading && (
                <Text style={styles.emptyText}>No hay pergaminos activos.</Text>
            )}

            {activeSubjects.map(subject => (
                <SubjectCard key={subject.id} item={subject} />
            ))}

            {completedSubjects.length > 0 && (
                <>
                    <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                        <Text style={styles.sectionTitle}>ARTES MÍSTICAS DOMINADAS</Text>
                    </View>
                    {completedSubjects.map(subject => (
                        <SubjectCard key={subject.id} item={subject} />
                    ))}
                </>
            )}
        </>
    );

    const ReadingView = () => (
        <>


            <ParchmentCard style={styles.atrilCard}>
                <View style={styles.atrilHeader}>
                    <BookText size={24} color="#8b4513" />
                    <Text style={styles.atrilTitle}>SALA DE LECTURA</Text>
                </View>

                <TouchableOpacity
                    style={styles.subjectSelector}
                    onPress={() => setIsBookPickerVisible(true)}
                >
                    <View style={styles.subjectSelectorLeft}>
                        <View style={[styles.colorDot, { backgroundColor: selectedBook?.cover_color || '#8b4513' }]} />
                        <Text style={styles.subjectSelectorText}>
                            {selectedBook
                                ? `${selectedBook.title}${selectedBook.saga ? ` - ${selectedBook.saga} ${toRoman(selectedBook.saga_index || 0)}` : ''}`
                                : "Selecciona un Tomo..."}
                        </Text>
                    </View>
                    <ChevronDown size={20} color="#8b4513" />
                </TouchableOpacity>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Pág. Actual</Text>
                        <Text style={styles.statValue}>{selectedBook?.current_page || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statValue}>{selectedBook?.total_pages || 0}</Text>
                    </View>
                </View>

                <MedievalButton
                    title="📖 INICIAR LECTURA"
                    onPress={handleStartReading}
                    disabled={isSessionActive}
                    style={styles.startBtn}
                />
            </ParchmentCard>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📚 TOMOS DE SABIDURÍA</Text>
            </View>

            {activeBooks.length === 0 && !loading && (
                <Text style={styles.emptyText}>No hay tomos en tu grimorio.</Text>
            )}

            {activeBooks.map(book => (
                <BookCard key={book.id} item={book} />
            ))}

            {finishedBooks.length > 0 && (
                <>
                    <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                        <Text style={styles.sectionTitle}>SABIDURÍA ASIMILADA</Text>
                    </View>
                    {finishedBooks.map(book => (
                        <BookCard key={book.id} item={book} />
                    ))}
                </>
            )}
        </>
    );


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.topHeader}>
                <Text style={styles.headerTitle}>GRAN BIBLIOTECA REAL</Text>
                <Text style={styles.headerSubtitle}>"El conocimiento es el arma definitiva"</Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabSelector}>
                {/* Animated Indicator Background */}
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
                    onPress={() => {
                        horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
                    }}
                >
                    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                        {/* INACTIVE LAYER */}
                        <Sword size={20} color="#8b4513" />

                        {/* ACTIVE LAYER (GLOWING) */}
                        <Animated.View style={{
                            position: 'absolute',
                            opacity: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: [1, 0]
                            }),
                            shadowColor: '#FFD700',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 5,
                        }}>
                            <Sword size={20} color="#FFD700" />
                        </Animated.View>
                    </View>

                    <Animated.Text style={[
                        styles.tabBtnText,
                        {
                            color: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: ['#FFD700', '#8b4513']
                            }),
                            textShadowColor: 'rgba(255, 215, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: [10, 0]
                            })
                        }
                    ]}>
                        FORJA DEL INTELECTO
                    </Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabBtn}
                    onPress={() => {
                        horizontalScrollRef.current?.scrollTo({ x: width, animated: true });
                    }}
                >
                    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                        {/* INACTIVE LAYER */}
                        <Scroll size={20} color="#8b4513" />

                        {/* ACTIVE LAYER (GLOWING) */}
                        <Animated.View style={{
                            position: 'absolute',
                            opacity: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: [0, 1]
                            }),
                            shadowColor: '#FFD700',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 5,
                        }}>
                            <Scroll size={20} color="#FFD700" />
                        </Animated.View>
                    </View>

                    <Animated.Text style={[
                        styles.tabBtnText,
                        {
                            color: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: ['#8b4513', '#FFD700']
                            }),
                            textShadowColor: 'rgba(255, 215, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: scrollX.interpolate({
                                inputRange: [0, width],
                                outputRange: [0, 10]
                            })
                        }
                    ]}>
                        ATALAYA DEL CONOCIMIENTO
                    </Animated.Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ width: width * 2 }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    if (offsetX >= width / 2) {
                        setViewMode('READING');
                    } else {
                        setViewMode('STUDY');
                    }
                }}
            >
                {/* STUDY PANE */}
                <ScrollView
                    style={{ width }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <StudyView />
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* READING PANE */}
                <ScrollView
                    style={{ width }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ReadingView />
                    <View style={{ height: 100 }} />
                </ScrollView>
            </ScrollView>

            {/* MODAL: Active Session (Unified) */}
            <Modal visible={isSessionActive} transparent animationType="slide">
                <View style={styles.sessionOverlay}>
                    <View style={styles.sessionContent}>
                        {isReadingStopModalVisible ? (
                            // --- VIEW: STOP READING INPUT ---
                            <View style={styles.stopReadingContainer}>
                                <Text style={styles.modalTitle}>FIN DE LECTURA</Text>
                                <Text style={styles.startBtn}>¿En qué página te has quedado?</Text>
                                <TextInput
                                    style={[styles.modalInput, { textAlign: 'center', fontSize: 30, width: 100 }]}
                                    value={endPageInput}
                                    onChangeText={setEndPageInput}
                                    keyboardType="number-pad"
                                    autoFocus
                                />
                                <MedievalButton
                                    title="GUARDAR PROGRESO"
                                    onPress={confirmStopReading}
                                    style={{ width: '100%', marginTop: 20 }}
                                />
                                <TouchableOpacity onPress={() => setIsReadingStopModalVisible(false)} style={{ marginTop: 20 }}>
                                    <Text style={{ color: '#d4af37', textDecorationLine: 'underline' }}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // --- VIEW: TIMER / STOPWATCH ---
                            <>
                                <View style={styles.sessionHeaderBox}>
                                    <View style={styles.sessionSubjectBox}>
                                        {selectedBook ? <Scroll size={20} color="#FFD700" /> : <BookOpen size={20} color="#FFD700" />}
                                        <Text style={styles.sessionSubjectName}>
                                            {selectedBook ? selectedBook.title : selectedSubject?.name}
                                        </Text>
                                    </View>

                                    {!selectedBook && (
                                        <View style={[styles.difficultyBadge, difficulty === 'CRUSADE' ? styles.badgeCrusade : styles.badgeExplorer]}>
                                            {difficulty === 'CRUSADE' ? <Shield size={12} color="#fff" /> : <Compass size={12} color="#fff" />}
                                            <Text style={styles.badgeText}>{difficulty}</Text>
                                        </View>
                                    )}

                                    {!selectedBook && difficulty === 'CRUSADE' && (
                                        <View style={styles.warnBox}>
                                            <AlertTriangle size={14} color="#e74c3c" />
                                            <Text style={styles.warnText}>Iron Will Activo</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.sessionTimerBox}>
                                    <Text style={styles.sessionTimeText}>
                                        {studyMode === 'TIMER' && elapsedSeconds > parseInt(targetMinutes) * 60 && !selectedBook ? '+' : ''}
                                        {formatElapsedTime(elapsedSeconds)}
                                    </Text>
                                </View>

                                {!selectedBook && studyMode === 'TIMER' && elapsedSeconds > parseInt(targetMinutes) * 60 && (
                                    <Text style={styles.overtimeText}>✨ ¡Objetivo Cumplido! Extra...</Text>
                                )}

                                <MedievalButton
                                    title={selectedBook ? "FINALIZAR LECTURA" : (studyMode === 'TIMER' && elapsedSeconds < parseInt(targetMinutes) * 60 ? "RENDIRSE" : "FINALIZAR")}
                                    onPress={selectedBook ? handleStopReadingPress : handleStopStudyPress}
                                    variant={!selectedBook && ((studyMode === 'TIMER' && elapsedSeconds < parseInt(targetMinutes) * 60) || difficulty === 'CRUSADE') ? "danger" : "primary"}
                                    style={styles.stopBtn}
                                />
                            </>
                        )}



                    </View>
                </View>
            </Modal>

            {/* MODALS: Add Subject & Picker */}
            <Modal visible={isAddModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.addModal}>
                        <Text style={styles.modalTitle}>NUEVO PERGAMINO</Text>

                        <Text style={styles.inputLabel}>Asignatura:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nombre"
                            value={newSubjectName}
                            onChangeText={setNewSubjectName}
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Curso:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="ej: 1º Bach"
                            value={newSubjectCourse}
                            onChangeText={setNewSubjectCourse}
                        />

                        <View style={styles.colorPalette}>
                            {SUBJECT_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorActive]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                            {customColors.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.colorOption, { backgroundColor: c.hex_code }, selectedColor === c.hex_code && styles.colorActive]}
                                    onPress={() => setSelectedColor(c.hex_code)}
                                />
                            ))}
                            <TouchableOpacity
                                style={[styles.colorOption, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}
                                onPress={() => {
                                    setColorPickerTarget('SUBJECT');
                                    setIsAddModalVisible(false);
                                    setTimeout(() => setIsCameraPickerVisible(true), 200);
                                }}
                            >
                                <Camera size={16} color="#FFD700" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.colorOption, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginLeft: 5 }]}
                                onPress={() => {
                                    setColorPickerTarget('SUBJECT');
                                    setIsAddModalVisible(false);
                                    setTimeout(() => setIsManualPickerVisible(true), 200);
                                }}
                            >
                                <Palette size={16} color="#FFD700" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBtns}>
                            <MedievalButton title="AÑADIR" onPress={handleAddSubject} style={{ flex: 1, marginRight: 10, minWidth: 0 }} />
                            <MedievalButton title="CANCELAR" variant="danger" onPress={() => setIsAddModalVisible(false)} style={{ flex: 1, minWidth: 0 }} />
                        </View>
                    </ParchmentCard>
                </View>
            </Modal>

            {/* MODAL: Book Picker */}
            <Modal visible={isBookPickerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.pickerModal}>
                        <Text style={styles.modalTitle}>TOMOS DE PODER</Text>
                        <FlatList
                            data={activeBooks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setSelectedBook(item);
                                        setIsBookPickerVisible(false);
                                    }}
                                >
                                    <View style={[styles.colorDot, { backgroundColor: item.cover_color || '#8b4513' }]} />
                                    <Text style={styles.pickerItemText}>
                                        {item.title}
                                        {item.saga ? ` - ${item.saga} ${toRoman(item.saga_index || 0)}` : ''}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>Vacío.</Text>}
                        />
                        <MedievalButton title="CERRAR" variant="danger" onPress={() => setIsBookPickerVisible(false)} />
                    </ParchmentCard>
                </View>
            </Modal>

            {/* MODAL: Subject Picker */}
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
                            ListEmptyComponent={<Text style={styles.emptyText}>Vacío.</Text>}
                        />
                        <MedievalButton title="CERRAR" variant="danger" onPress={() => setIsSubjectPickerVisible(false)} />
                    </ParchmentCard>
                </View>
            </Modal>

            {/* MODAL: Add Book */}
            <Modal visible={isAddBookVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.addModal}>
                        <Text style={styles.modalTitle}>NUEVO TOMO</Text>

                        <Text style={styles.inputLabel}>Título:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Título"
                            value={newBookTitle}
                            onChangeText={setNewBookTitle}
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Autor:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Autor (opcional)"
                            value={newBookAuthor}
                            onChangeText={setNewBookAuthor}
                        />

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2, marginRight: 10 }}>
                                <Text style={styles.inputLabel}>Saga:</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="ej: El Archivo..."
                                    value={newBookSaga}
                                    onChangeText={setNewBookSaga}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Libro #:</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="1"
                                    value={newBookSagaIndex}
                                    onChangeText={setNewBookSagaIndex}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Páginas:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Total"
                            value={newBookTotalPages}
                            onChangeText={setNewBookTotalPages}
                            keyboardType="number-pad"
                        />

                        <View style={styles.colorPalette}>
                            {BOOK_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, newBookCoverColor === color && styles.colorActive]}
                                    onPress={() => setNewBookCoverColor(color)}
                                />
                            ))}
                            {customColors.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.colorOption, { backgroundColor: c.hex_code }, newBookCoverColor === c.hex_code && styles.colorActive]}
                                    onPress={() => setNewBookCoverColor(c.hex_code)}
                                />
                            ))}
                            <TouchableOpacity
                                style={[styles.colorOption, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}
                                onPress={() => {
                                    setColorPickerTarget('BOOK');
                                    setIsAddBookVisible(false);
                                    setTimeout(() => setIsCameraPickerVisible(true), 200);
                                }}
                            >
                                <Camera size={16} color="#FFD700" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.colorOption, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginLeft: 5 }]}
                                onPress={() => {
                                    setColorPickerTarget('BOOK');
                                    setIsAddBookVisible(false);
                                    setTimeout(() => setIsManualPickerVisible(true), 200);
                                }}
                            >
                                <Palette size={16} color="#FFD700" />
                            </TouchableOpacity>
                        </View>


                        <View style={styles.modalBtns}>
                            <MedievalButton title="AÑADIR" onPress={handleAddBook} style={{ flex: 1, marginRight: 10, minWidth: 0 }} />
                            <MedievalButton title="CANCELAR" variant="danger" onPress={() => setIsAddBookVisible(false)} style={{ flex: 1, minWidth: 0 }} />
                        </View>
                    </ParchmentCard>
                </View>
            </Modal>

            <CameraColorPicker
                visible={isCameraPickerVisible}
                onClose={() => {
                    setIsCameraPickerVisible(false);
                    // Restore original modal
                    setTimeout(() => {
                        if (colorPickerTarget === 'SUBJECT') setIsAddModalVisible(true);
                        else if (colorPickerTarget === 'BOOK') setIsAddBookVisible(true);
                    }, 400);
                }}
                onColorSelect={(color) => {
                    saveCustomColor(color); // Save to DB correctly
                    if (colorPickerTarget === 'SUBJECT') {
                        setSelectedColor(color);
                    } else if (colorPickerTarget === 'BOOK') {
                        setNewBookCoverColor(color);
                    }
                }}
            />

            <ManualColorPicker
                visible={isManualPickerVisible}
                onClose={() => {
                    setIsManualPickerVisible(false);
                    setTimeout(() => {
                        if (colorPickerTarget === 'SUBJECT') setIsAddModalVisible(true);
                        else if (colorPickerTarget === 'BOOK') setIsAddBookVisible(true);
                    }, 400);
                }}
                onColorSelect={(color) => {
                    saveCustomColor(color);
                    if (colorPickerTarget === 'SUBJECT') {
                        setSelectedColor(color);
                    } else if (colorPickerTarget === 'BOOK') {
                        setNewBookCoverColor(color);
                    }
                }}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#2d1a12',
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
        fontSize: 14,
        color: '#d4af37',
        fontStyle: 'italic',
        marginTop: 4,
    },
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: '#3d2b1f',
        padding: 4,
        margin: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#5d3b2a',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: '#5d3b2a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    tabBtnText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 100,
        alignItems: 'center',
    },

    atrilCard: {
        width: width * 0.9,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        elevation: 5,
    },
    atrilHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    atrilTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8b4513',
        marginLeft: 10,
    },
    subjectSelector: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
        marginBottom: 20,
    },
    subjectSelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectSelectorText: {
        marginLeft: 10,
        color: '#3d2b1f',
        fontWeight: 'bold',
        maxWidth: width * 0.5,
    },
    modeTabs: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    modeTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    activeModeTab: {
        backgroundColor: '#8b4513',
    },
    modeTabText: {
        color: '#8b4513',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 12,
    },
    activeModeTabText: {
        color: '#fff',
    },
    difficultyContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    diffLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 8,
    },
    diffGroup: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        padding: 4,
    },
    diffBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 16,
    },
    diffBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8b4513',
        marginLeft: 5,
    },
    diffActiveExplorer: {
        backgroundColor: '#2980b9',
    },
    diffActiveCrusade: {
        backgroundColor: '#c0392b',
    },
    textWhite: {
        color: '#fff',
    },
    timerConfig: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        padding: 10,
        borderRadius: 8,
    },
    minutesInput: {
        width: 40,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8b4513',
        borderBottomWidth: 1,
        borderBottomColor: '#8b4513',
        marginHorizontal: 10,
    },
    minutesLabel: {
        color: '#8b4513',
        fontSize: 12,
    },
    startBtn: {
        width: '100%',
        marginTop: 10,
    },
    sectionHeader: {
        width: width * 0.9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d4af37',
    },
    addBtn: {
        padding: 5,
    },
    subjectCard: {
        width: width * 0.9,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    colorTab: {
        width: 10,
        height: 40,
        borderRadius: 5,
        marginRight: 15,
    },
    subjectInfo: {
        flex: 1,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    subjectMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    courseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 10,
    },
    courseText: {
        fontSize: 10,
        color: '#8b4513',
        fontWeight: 'bold',
    },
    subjectStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectTime: {
        fontSize: 12,
        color: '#8b4513',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    completeBtn: {
        padding: 10,
    },
    reactivateBtn: {
        padding: 10,
    },
    emptyText: {
        color: '#fff',
        opacity: 0.5,
        fontStyle: 'italic',
        marginTop: 20,
    },
    sessionOverlay: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sessionContent: {
        width: width,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    sessionHeaderBox: {
        alignItems: 'center',
        marginBottom: 40,
    },
    sessionSubjectBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sessionSubjectName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: 10,
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeExplorer: {
        backgroundColor: '#2980b9',
    },
    badgeCrusade: {
        backgroundColor: '#c0392b',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    warnBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    warnText: {
        color: '#e74c3c',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    sessionTimerBox: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        borderWidth: 8,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    sessionTimeText: {
        fontSize: 54,
        color: '#fff',
        fontWeight: '300',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    overtimeText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 30,
        fontStyle: 'italic',
    },
    stopBtn: {
        width: width * 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addModal: {
        width: width * 0.85,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8b4513',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 5,
        marginLeft: 2,
        opacity: 0.8,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#3d2b1f',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 25,
    },
    colorOption: {
        width: 35,
        height: 35,
        borderRadius: 18,
        margin: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorActive: {
        borderColor: '#fff',
        scaleX: 1.2,
        scaleY: 1.2,
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
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
    },
    pickerItemText: {
        fontSize: 16,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    // Reading new styles
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 10,
        borderRadius: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#8b4513',
        marginBottom: 3,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    progressBarBg: {
        height: 8,
        width: '100%',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderRadius: 4,
        marginTop: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#27ae60',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 10,
        color: '#8b4513',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    stopReadingContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
    },
});
