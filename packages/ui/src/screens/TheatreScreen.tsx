import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    DeviceEventEmitter,
    Animated
} from 'react-native';
import { MedievalButton, ParchmentCard, ScreenWrapper } from '..';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Drama,
    Music,
    Ticket,
    Star,
    Plus,
    Clock,
    Calendar,
    ChevronDown,
    ChevronUp,
    Pencil,
    Film,
    Clapperboard,
    PlayCircle,
    History
} from 'lucide-react-native';
import { useTheatre, TheatreActivity, TheatreMovie, TheatreSeries, TheatreSeason, formatTimeDisplay, formatElapsedTime } from '@omega/logic';

const { width } = Dimensions.get('window');
const AnimatedMusic = Animated.createAnimatedComponent(Music);
const AnimatedTicket = Animated.createAnimatedComponent(Ticket);

export const TheatreScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const {
        activities,
        movies,
        series,
        loading,
        error,
        activityStats,
        isSessionActive,
        elapsedSeconds,
        selectedActivity,
        setSelectedActivity,
        addActivity,
        addMovie,
        addSeries,
        addSeason,
        updateActivity,
        updateMovie,
        updateSeries,
        updateSeason,
        startSession,
        stopSession,
        cancelSession,
    } = useTheatre();

    const [viewMode, setViewMode] = useState<'CAMERINOS' | 'TAQUILLA'>('CAMERINOS');
    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    // Quick Add Branched State
    const [quickAddStep, setQuickAddStep] = useState<'ACTIVITY' | 'TYPE_TAQUILLA' | 'MOVIE' | 'SERIES' | 'SEASON' | 'SEASON_NEW_SERIES'>('ACTIVITY');

    // Form States
    const [actName, setActName] = useState('');
    const [movTitle, setMovTitle] = useState('');
    const [movDirector, setMovDirector] = useState('');
    const [movSaga, setMovSaga] = useState('');
    const [movComment, setMovComment] = useState('');
    const [serTitle, setSerTitle] = useState('');
    const [selectedSerId, setSelectedSerId] = useState('');
    const [seasNum, setSeasNum] = useState('');
    const [seasEps, setSeasEps] = useState('');
    const [seasComment, setSeasComment] = useState('');
    const [formRating, setFormRating] = useState(0);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    // Accordion States
    const [expandedMovies, setExpandedMovies] = useState<Set<string>>(new Set());
    const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

    const toggleMovie = (id: string) => {
        setExpandedMovies(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSeries = (id: string) => {
        setExpandedSeries(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (route.params?.activityId && activities.length > 0) {
            const act = activities.find(a => a.id === route.params.activityId);
            if (act) {
                setSelectedActivity(act);
                // Also ensure we are in CAMERINOS view
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
            }
        }
    }, [route.params?.activityId, activities]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('GLOBAL_QUICK_ADD', () => {
            if (viewMode === 'CAMERINOS') {
                setQuickAddStep('ACTIVITY');
            } else {
                setQuickAddStep('TYPE_TAQUILLA');
            }
            setIsQuickAddVisible(true);
        });
        return () => subscription.remove();
    }, [viewMode]);

    return (
        <ScreenWrapper background="#1a0f0a">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.topHeader}>
                    <Text style={styles.headerTitle}>GRAN TEATRO REAL</Text>
                    <Text style={styles.headerSubtitle}>"Donde la magia cobra vida"</Text>
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
                            <Music size={20} color="#8b4513" />

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
                                <Music size={20} color="#FFD700" />
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
                            CAMERINOS
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
                            <Ticket size={20} color="#8b4513" />

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
                                <Ticket size={20} color="#FFD700" />
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
                            TAQUILLA
                        </Animated.Text>
                    </TouchableOpacity>
                </View>

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
                        if (offsetX >= width / 2) {
                            setViewMode('TAQUILLA');
                        } else {
                            setViewMode('CAMERINOS');
                        }
                    }}
                >
                    {/* CAMERINOS PANE */}
                    <ScrollView
                        style={{ width }}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <CamerinosView
                            activities={activities}
                            stats={activityStats}
                            onStartSession={startSession}
                        />
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* TAQUILLA PANE */}
                    <ScrollView
                        style={{ width }}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <TaquillaView
                            movies={movies}
                            series={series}
                            expandedMovies={expandedMovies}
                            expandedSeries={expandedSeries}
                            toggleMovie={toggleMovie}
                            toggleSeries={toggleSeries}
                        />
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </ScrollView>

                {/* QUICK ADD MODAL */}
                <Modal
                    visible={isQuickAddVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsQuickAddVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <ParchmentCard style={styles.modalContent}>


                            {quickAddStep === 'TYPE_TAQUILLA' && (
                                <View>
                                    <Text style={styles.modalTitle}>¿Qué deseas añadir?</Text>
                                    <MedievalButton
                                        title="Película"
                                        onPress={() => setQuickAddStep('MOVIE')}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Serie / Temporada"
                                        onPress={() => setQuickAddStep('SERIES')}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Cancelar"
                                        onPress={() => setIsQuickAddVisible(false)}
                                        style={styles.modalBtn}
                                    />
                                </View>
                            )}

                            {quickAddStep === 'ACTIVITY' && (
                                <View>
                                    <Text style={styles.modalTitle}>Nueva Actividad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre (ej. Piano, Malabares...)"
                                        value={actName}
                                        onChangeText={setActName}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <MedievalButton
                                        title="Crear"
                                        onPress={async () => {
                                            if (!actName) return;
                                            await addActivity(actName);
                                            setActName('');
                                            setIsQuickAddVisible(false);
                                        }}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Cancelar"
                                        onPress={() => setIsQuickAddVisible(false)}
                                        style={styles.modalBtn}
                                    />
                                </View>
                            )}

                            {quickAddStep === 'MOVIE' && (
                                <ScrollView scrollEnabled={scrollEnabled}>
                                    <Text style={styles.modalTitle}>Nueva Película</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Título"
                                        value={movTitle}
                                        onChangeText={setMovTitle}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Director (opcional)"
                                        value={movDirector}
                                        onChangeText={setMovDirector}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Saga (opcional)"
                                        value={movSaga}
                                        onChangeText={setMovSaga}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <TextInput
                                        style={[styles.input, { height: 80 }]}
                                        placeholder="Comentario (opcional)"
                                        multiline
                                        value={movComment}
                                        onChangeText={setMovComment}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <StarRatingSlider
                                        value={formRating}
                                        onChange={setFormRating}
                                        onInteractionStart={() => setScrollEnabled(false)}
                                        onInteractionEnd={() => setScrollEnabled(true)}
                                    />

                                    <MedievalButton
                                        title="Añadir a Taquilla"
                                        onPress={async () => {
                                            if (!movTitle) {
                                                Alert.alert('Información', 'La película necesita al menos un título.');
                                                return;
                                            }
                                            try {
                                                await addMovie(movTitle, movDirector, movSaga, movComment, formRating);
                                                setMovTitle(''); setMovDirector(''); setMovSaga(''); setMovComment('');
                                                setFormRating(0);
                                                setIsQuickAddVisible(false);
                                            } catch (error: any) {
                                                Alert.alert('Error', 'No se pudo guardar la película: ' + error.message);
                                            }
                                        }}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Atrás"
                                        onPress={() => setQuickAddStep('TYPE_TAQUILLA')}
                                        style={styles.modalBtn}
                                    />
                                </ScrollView>
                            )}

                            {quickAddStep === 'SERIES' && (
                                <View>
                                    <Text style={styles.modalTitle}>Serie o Temporada</Text>
                                    <MedievalButton
                                        title="Nueva Serie"
                                        onPress={() => setQuickAddStep('SEASON_NEW_SERIES')}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Añadir Temporada"
                                        onPress={() => setQuickAddStep('SEASON')}
                                        style={styles.modalBtn}
                                        disabled={series.length === 0}
                                    />
                                    <MedievalButton
                                        title="Atrás"
                                        onPress={() => setQuickAddStep('TYPE_TAQUILLA')}
                                        style={styles.modalBtn}
                                    />
                                </View>
                            )}

                            {quickAddStep === 'SEASON_NEW_SERIES' && (
                                <View>
                                    <Text style={styles.modalTitle}>Nueva Serie</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre de la Serie"
                                        value={serTitle}
                                        onChangeText={setSerTitle}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <MedievalButton
                                        title="Registrar"
                                        onPress={async () => {
                                            if (!serTitle) return;
                                            await addSeries(serTitle);
                                            setSerTitle('');
                                            setIsQuickAddVisible(false);
                                        }}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Atrás"
                                        onPress={() => setQuickAddStep('SERIES')}
                                        style={styles.modalBtn}
                                    />
                                </View>
                            )}

                            {quickAddStep === 'SEASON' && (
                                <ScrollView scrollEnabled={scrollEnabled}>
                                    <Text style={styles.modalTitle}>Nueva Temporada</Text>
                                    <Text style={styles.label}>Seleccionar Serie:</Text>
                                    {series.map(s => (
                                        <TouchableOpacity
                                            key={s.id}
                                            onPress={() => setSelectedSerId(s.id)}
                                            style={[styles.serPickerItem, selectedSerId === s.id && styles.serPickerItemActive]}
                                        >
                                            <Text style={[styles.serPickerText, selectedSerId === s.id && styles.serPickerTextActive]}>
                                                {s.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nº Temporada"
                                        keyboardType="numeric"
                                        value={seasNum}
                                        onChangeText={setSeasNum}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nº Capítulos (opcional)"
                                        keyboardType="numeric"
                                        value={seasEps}
                                        onChangeText={setSeasEps}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <TextInput
                                        style={[styles.input, { height: 80 }]}
                                        placeholder="Comentario (opcional)"
                                        multiline
                                        value={seasComment}
                                        onChangeText={setSeasComment}
                                        placeholderTextColor="#8b4513"
                                    />
                                    <StarRatingSlider
                                        value={formRating}
                                        onChange={setFormRating}
                                        onInteractionStart={() => setScrollEnabled(false)}
                                        onInteractionEnd={() => setScrollEnabled(true)}
                                    />

                                    <MedievalButton
                                        title="Añadir Temporada"
                                        onPress={async () => {
                                            if (!selectedSerId) {
                                                Alert.alert('Información', 'Por favor, selecciona una serie de la lista.');
                                                return;
                                            }
                                            if (!seasNum) {
                                                Alert.alert('Información', 'Introduce el número de la temporada.');
                                                return;
                                            }

                                            try {
                                                await addSeason(selectedSerId, parseInt(seasNum), seasEps ? parseInt(seasEps) : undefined, seasComment, formRating);
                                                setSelectedSerId(''); setSeasNum(''); setSeasEps(''); setSeasComment('');
                                                setFormRating(0);
                                                setIsQuickAddVisible(false);
                                            } catch (error: any) {
                                                Alert.alert('Error', 'Hubo un problema al guardar: ' + error.message);
                                            }
                                        }}
                                        style={styles.modalBtn}
                                    />
                                    <MedievalButton
                                        title="Atrás"
                                        onPress={() => setQuickAddStep('SERIES')}
                                        style={styles.modalBtn}
                                    />
                                </ScrollView>
                            )}
                        </ParchmentCard>
                    </View>
                </Modal>

                {/* SESSION MODAL */}
                <Modal
                    visible={isSessionActive}
                    animationType="fade"
                    transparent={false}
                >
                    <View style={[styles.sessionOverlay, { backgroundColor: '#1a0f0a' }]}>
                        <View style={styles.sessionContent}>
                            <View style={styles.sessionHeaderBox}>
                                <View style={styles.sessionSubjectBox}>
                                    <Drama size={24} color="#FFD700" />
                                    <Text style={styles.sessionSubjectName}>{selectedActivity?.name || 'Actividad'}</Text>
                                </View>
                            </View>

                            <View style={styles.sessionTimerBox}>
                                <Text style={styles.sessionTimeText}>{formatElapsedTime(elapsedSeconds)}</Text>
                            </View>

                            <MedievalButton
                                title="FINALIZAR"
                                onPress={() => stopSession()}
                                style={styles.stopBtn}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        'Descartar Sesión',
                                        '¿Estás seguro de que quieres borrar este tiempo?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Sí, borrar', onPress: cancelSession }
                                        ]
                                    );
                                }}
                                style={{ marginTop: 20 }}
                            >
                                <Text style={{ color: '#d4af37', textDecorationLine: 'underline' }}>Descartar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
};

// --- SUB-COMPONENTS ---

const CamerinosView = ({ activities, stats, onStartSession }: any) => {
    const sortedActivities = [...activities].sort((a, b) => {
        const timeA = a.total_minutes || 0;
        const timeB = b.total_minutes || 0;
        return timeB - timeA;
    });

    return (
        <View style={styles.viewContainer}>
            {sortedActivities.length === 0 && (
                <Text style={styles.emptyText}>Los camerinos están vacíos. ¡Crea una actividad!</Text>
            )}
            {sortedActivities.map((act: TheatreActivity) => (
                <ActivityCard
                    key={act.id}
                    activity={act}
                    onStartSession={onStartSession}
                />
            ))}
        </View>
    );
};

const ActivityCard = ({ activity, onStartSession }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <ParchmentCard style={styles.card}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.cardHeader}
            >
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{activity.name}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Clock size={12} color="#8b4513" />
                            <Text style={styles.statText}>{formatTimeDisplay(activity.total_minutes || 0)}</Text>
                        </View>
                        <View style={[styles.stat, { marginLeft: 15 }]}>
                            <Calendar size={12} color="#8b4513" />
                            <Text style={styles.statText}>{(activity.days_count || 0)} días</Text>
                        </View>
                    </View>
                </View>
                {isExpanded ? <ChevronUp size={20} color="#8b4513" /> : <ChevronDown size={20} color="#8b4513" />}
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    <MedievalButton
                        title="Registrar Tiempo"
                        onPress={() => onStartSession(activity)}
                        style={styles.registerBtn}
                    />
                </View>
            )}
        </ParchmentCard>
    );
};

const StarDisplay = ({ rating, size = 16 }: { rating: number, size?: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[...Array(5)].map((_, i) => {
                if (i < fullStars) return <Star key={i} size={size} color="#FFD700" fill="#FFD700" />;
                if (i === fullStars && hasHalf) return <Star key={i} size={size} color="#FFD700" fill="#FFD700" style={{ opacity: 0.7 }} />;
                return <Star key={i} size={size} color="#8b4513" style={{ opacity: 0.3 }} />;
            })}
        </View>
    );
};

const StarRatingSlider = ({ value, onChange, onInteractionStart, onInteractionEnd }: {
    value: number,
    onChange: (v: number) => void,
    onInteractionStart?: () => void,
    onInteractionEnd?: () => void
}) => {
    const [sliderWidth, setSliderWidth] = useState(0);
    const sliderRef = useRef<View>(null);

    const updateValue = (evt: any) => {
        const x = evt.nativeEvent.locationX;
        if (sliderWidth > 0) {
            let newVal = (x / sliderWidth) * 5;
            newVal = Math.round(newVal * 2) / 2;
            if (newVal < 0) newVal = 0;
            if (newVal > 5) newVal = 5;
            onChange(newVal);
        }
    };

    return (
        <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <View style={{ marginBottom: 15 }} pointerEvents="none">
                <StarDisplay rating={value} size={32} />
            </View>
            <View
                ref={sliderRef}
                style={{
                    width: width * 0.7,
                    height: 40,
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                }}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(evt) => {
                    onInteractionStart?.();
                    updateValue(evt);
                }}
                onResponderMove={(evt) => {
                    updateValue(evt);
                }}
                onResponderRelease={() => {
                    onInteractionEnd?.();
                }}
                onResponderTerminate={() => {
                    onInteractionEnd?.();
                }}
            >
                {/* Track */}
                <View pointerEvents="none" style={{
                    height: 8,
                    backgroundColor: 'rgba(139, 69, 19, 0.15)',
                    borderRadius: 4,
                    width: '100%'
                }} />

                {/* Progress */}
                <View pointerEvents="none" style={{
                    position: 'absolute',
                    height: 8,
                    backgroundColor: '#FFD700',
                    borderRadius: 4,
                    width: `${Math.max(0, Math.min(100, (value / 5) * 100))}%`
                }} />

                {/* Thumb */}
                <View pointerEvents="none" style={{
                    position: 'absolute',
                    left: `${Math.max(0, Math.min(100, (value / 5) * 100))}%`,
                    marginLeft: -12,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFD700',
                    borderWidth: 2,
                    borderColor: '#8b4513',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                }} />
            </View>
        </View>
    );
};

const TaquillaView = ({ movies, series, expandedMovies, expandedSeries, toggleMovie, toggleSeries }: any) => (
    <View style={styles.viewContainer}>
        <Text style={styles.sectionTitle}>🎬 PELÍCULAS</Text>
        {movies.map((mov: TheatreMovie) => (
            <ParchmentCard key={mov.id} style={styles.card}>
                <TouchableOpacity onPress={() => toggleMovie(mov.id)} style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{mov.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <StarDisplay rating={mov.rating || 0} size={12} />
                            <Text style={[styles.cardSubtitle, { marginLeft: 10 }]}>{mov.director || 'Director desconocido'}</Text>
                        </View>
                    </View>
                    {expandedMovies.has(mov.id) ? <ChevronUp size={20} color="#8b4513" /> : <ChevronDown size={20} color="#8b4513" />}
                </TouchableOpacity>
                {expandedMovies.has(mov.id) && mov.comment && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.commentText}>"{mov.comment}"</Text>
                    </View>
                )}
            </ParchmentCard>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>📺 SERIES</Text>
        {series.map((ser: any) => {
            const hasSeasons = ser.seasons && ser.seasons.length > 0;
            const avgRating = hasSeasons
                ? (ser.seasons.reduce((acc: number, s: any) => acc + (s.rating || 0), 0) / ser.seasons.length).toFixed(1)
                : 0;

            return (
                <ParchmentCard key={ser.id} style={styles.card}>
                    <TouchableOpacity onPress={() => toggleSeries(ser.id)} style={styles.cardHeader}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{ser.title}</Text>
                            {hasSeasons && <StarDisplay rating={Number(avgRating)} size={12} />}
                        </View>
                        {expandedSeries.has(ser.id) ? <ChevronUp size={20} color="#8b4513" /> : <ChevronDown size={20} color="#8b4513" />}
                    </TouchableOpacity>
                    {expandedSeries.has(ser.id) && (
                        <View style={styles.expandedContent}>
                            {[...ser.seasons].sort((a, b) => b.season_number - a.season_number).map((seas: TheatreSeason) => (
                                <View key={seas.id} style={styles.seasonRow}>
                                    <View style={styles.seasonHeader}>
                                        <Text style={styles.seasonTitle}>Temporada {seas.season_number}</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <StarDisplay rating={seas.rating || 0} size={10} />
                                            <Text style={styles.epCount}>{seas.episodes_count || '?'} caps</Text>
                                        </View>
                                    </View>
                                    {seas.comment && <Text style={styles.seasonComment}>"{seas.comment}"</Text>}
                                </View>
                            ))}
                        </View>
                    )}
                </ParchmentCard>
            );
        })}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0f0a', // Dark wooden theater floor
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
        borderBottomColor: '#5d3b2a',
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabBtnActive: {
        // No longer used as background, we have sliding indicator
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
    tabBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tabBtnTextActive: {
        // Handled by interpolation
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    viewContainer: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    card: {
        marginBottom: 12,
        padding: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#8b4513',
        opacity: 0.8,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 6,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: '#5d3b2a',
        marginLeft: 4,
        fontWeight: '600',
    },
    expandedContent: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    registerBtn: {
        height: 50,
    },
    commentText: {
        fontSize: 14,
        color: '#3d2b1f',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    seasonRow: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.05)',
    },
    seasonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    seasonTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    epCount: {
        fontSize: 12,
        color: '#8b4513',
        fontWeight: '600',
    },
    seasonComment: {
        fontSize: 13,
        color: '#5d3b2a',
        fontStyle: 'italic',
    },
    emptyText: {
        color: '#d4af37',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#5d3b2a',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalBtn: {
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        borderWidth: 1,
        borderColor: '#8b4513',
        borderRadius: 8,
        padding: 12,
        color: '#3d2b1f',
        marginBottom: 15,
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 8,
    },
    serPickerItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#8b4513',
        borderRadius: 6,
        marginBottom: 8,
    },
    serPickerItemActive: {
        backgroundColor: '#8b4513',
    },
    serPickerText: {
        color: '#8b4513',
    },
    serPickerTextActive: {
        color: '#fff',
    },
    sessionOverlay: {
        flex: 1,
        backgroundColor: '#1a0f0a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sessionContent: {
        width: width,
        height: Dimensions.get('window').height,
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
    stopBtn: {
        width: width * 0.7,
    },
});

