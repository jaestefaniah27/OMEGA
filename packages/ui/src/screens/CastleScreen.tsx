import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    DeviceEventEmitter,
    Platform
} from 'react-native';
import { MedievalButton } from '../MedievalButton';
import { ParchmentCard } from '../ParchmentCard';
import { useNavigation } from '@react-navigation/native';
import {
    Trophy,
    CheckSquare,
    Square,
    PlusCircle,
    Scroll as ScrollIcon,
    Crown,
    Shield,
    History,
    Sword,
    Scroll,
    GraduationCap,
    Clock,
    Music
} from 'lucide-react-native';
import { useGame, RoyalDecree } from '@omega/logic';
import { RoyalDecreeModal } from '../components/RoyalDecreeModal';

const { width } = Dimensions.get('window');

export const CastleScreen: React.FC = React.memo(() => {
    const navigation = useNavigation();
    const { castle, habits, library, theatre } = useGame();
    const { subjects } = library;
    const { activities } = theatre;
    const { decrees, loading, addDecree, updateDecree, deleteDecree } = castle;
    const [modalVisible, setModalVisible] = useState(false);

    // Tab Logic
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const parentIds = useMemo(() => {
        const set = new Set<string>();
        decrees.forEach(d => {
            if (d.parent_id) set.add(d.parent_id);
        });
        return set;
    }, [decrees]);

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter logic for Throne Room:
    // 1. Show all non-repetitive pending tasks (Anchor or One-shot)
    // 2. Show repetitive instances ONLY if they are due TODAY or are OVERDUE
    // 3. Hide future repetitive instances to avoid clutter
    const activeDecrees = decrees.filter(d => {
        if (d.status !== 'PENDING') return false;

        const isRepetitiveInstance = !!(d as any).parent_id;
        const isMasterWithInstances = parentIds.has(d.id);

        if (isRepetitiveInstance) {
            // Only show if due today or past due
            if (!d.due_date) return true;
            const dueStr = d.due_date.split('T')[0];
            return dueStr <= todayStr;
        }

        if (isMasterWithInstances) {
            // Hide the master record from the 'Active' list if it has exploded instances
            // (The instances will show up on their respective days instead)
            return false;
        }

        // Masters (without instances yet) or one-shots always show if pending
        return true;
    }).sort((a, b) => {
        // If neither has a date, keep order
        if (!a.due_date && !b.due_date) return 0;
        // Move tasks without date to the end
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        // Chronological sort
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    const completedDecrees = decrees.filter(d => d.status === 'COMPLETED').slice(0, 50); // Cap archive view for performance

    // --- QUICK ADD HUD LISTENER ---
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_QUICK_ADD', () => {
            setModalVisible(true);
        });
        return () => sub.remove();
    }, []);

    const getZoneInfo = (ritual: any): { label: string; icon: any; color: string } => {
        switch (ritual.activity_type) {
            case 'LIBRARY':
                let libLabel = 'Biblioteca';
                if (ritual.activity_tag === 'STUDY') libLabel = 'Estudio';
                else if (ritual.activity_tag === 'READING') libLabel = 'Lectura';
                else {
                    const sub = subjects.find(s => s.id === ritual.activity_tag);
                    if (sub) libLabel = sub.name;
                }
                return { label: libLabel, icon: GraduationCap as any, color: '#3498db' };
            case 'THEATRE':
                let pathLabel = 'Teatro';
                const act = activities.find(a => a.id === ritual.activity_tag);
                if (act) pathLabel = act.name;
                return { label: pathLabel, icon: Music as any, color: '#9b59b6' };
            case 'BARRACKS':
                return { label: 'Entrenar', icon: Sword as any, color: '#e67e22' };
            default:
                return { label: 'General', icon: Scroll as any, color: '#7f8c8d' };
        }
    };

    const handleRitualPress = (ritual: any) => {
        if (!ritual.activity_type) return;

        switch (ritual.activity_type) {
            case 'LIBRARY':
                // Check if it's reading or study based on the tag
                let mode = 'STUDY';
                let subjectId: string | undefined;
                let bookId: string | undefined;

                if (ritual.activity_tag === 'READING') {
                    mode = 'READING';
                } else if (ritual.activity_tag === 'STUDY') {
                    mode = 'STUDY';
                } else {
                    // Check if tag is a subject or book ID
                    const isSubject = library.subjects.some(s => s.id === ritual.activity_tag);
                    const isBook = library.books.some(b => b.id === ritual.activity_tag);

                    if (isBook) {
                        mode = 'READING';
                        bookId = ritual.activity_tag;
                    } else if (isSubject) {
                        mode = 'STUDY';
                        subjectId = ritual.activity_tag;
                    }
                }

                (navigation as any).navigate('Library', { mode, subjectId, bookId });
                break;
            case 'BARRACKS':
                const routineId = ritual.activity_tag !== 'GENERAL' ? ritual.activity_tag : undefined;
                (navigation as any).navigate('Barracks', { routineId });
                break;
            case 'THEATRE':
                (navigation as any).navigate('Theatre', { activityId: ritual.activity_tag });
                break;
            default:
                break;
        }
    };

    const toggleGeneralDecree = async (decree: RoyalDecree) => {
        if (decree.type !== 'GENERAL') return;
        const isCompleted = decree.status === 'COMPLETED';
        const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';
        await updateDecree(decree.id, {
            status: newStatus,
            current_quantity: newStatus === 'COMPLETED' ? decree.target_quantity : 0,
            completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : null
        });
    };

    const renderDecree = (decree: RoyalDecree, isArchive = false) => {
        const progress = (decree.current_quantity / (decree.target_quantity || 1)) * 100;
        const isGeneral = decree.type === 'GENERAL';

        const isInstance = !!(decree as any).parent_id;
        const examDate = decree.due_date ? new Date(decree.due_date) : null;
        const now = new Date();
        const hoursLeft = examDate ? (examDate.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
        const isTodayOrPast = !decree.due_date || hoursLeft! <= 0 || (decree.due_date.split('T')[0] <= todayStr);

        const renderExamCountdown = () => {
            if (!examDate || isArchive || decree.status === 'COMPLETED') return null;

            const maxCountdownHours = 100;
            const currentHours = Math.max(0, hoursLeft!);
            const percentage = Math.min(100, (currentHours / maxCountdownHours) * 100);

            // Color interpolation (Green -> Yellow -> Red)
            let barColor = '#27ae60'; // Green
            if (percentage < 30) {
                barColor = '#c0392b'; // Red
            } else if (percentage < 60) {
                barColor = '#d35400'; // Orange
            } else if (percentage < 85) {
                barColor = '#f1c40f'; // Yellow
            }

            return (
                <View style={styles.examCountdownWrapper}>
                    <View style={styles.progressHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={12} color={currentHours > 0 ? "#8b4513" : "#c0392b"} />
                            <Text style={[styles.countdownLabel, currentHours <= 0 && { color: '#c0392b' }]}>
                                {currentHours > 0 ? "Tiempo para el inicio" : "Examen en curso/vencido"}
                            </Text>
                        </View>
                        {currentHours > 0 && (
                            <Text style={styles.countdownValue}>{Math.floor(currentHours)}h</Text>
                        )}
                    </View>

                    {currentHours > 0 && (
                        <View style={styles.examProgressBarBg}>
                            <View style={[
                                styles.examProgressBarFill,
                                { width: `${percentage}%`, backgroundColor: barColor }
                            ]} />
                        </View>
                    )}
                </View>
            );
        };

        return (
            <View key={decree.id} style={styles.decreeItem}>
                <View style={styles.decreeHeader}>
                    {isGeneral && !isArchive && (!isInstance || isTodayOrPast) ? (
                        <TouchableOpacity onPress={() => toggleGeneralDecree(decree)}>
                            <Square size={20} color="#3d2b1f" />
                        </TouchableOpacity>
                    ) : decree.type === 'EXAM' ? (
                        <GraduationCap size={20} color="#d4af37" />
                    ) : (
                        <ScrollIcon size={20} color="#3d2b1f" />
                    )}
                    <Text style={[styles.decreeTitle, isGeneral && (!isInstance || isTodayOrPast) && { marginLeft: 10 }]}>{decree.title}</Text>
                    {isArchive && (
                        <View style={styles.completedBadge}>
                            <Trophy size={10} color="#27ae60" />
                            <Text style={styles.completedBadgeText}>CUMPLIDO</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.decreeDesc}>{decree.description}</Text>

                {decree.type === 'EXAM' ? renderExamCountdown() : (
                    (!isGeneral || decree.target_quantity > 1) && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>
                                    {decree.unit === 'MINUTES'
                                        ? `${decree.current_quantity}m / ${decree.target_quantity}m`
                                        : `${decree.current_quantity} / ${decree.target_quantity} ${decree.unit === 'SESSIONS' ? 'Sesiones' : 'Páginas'}`
                                    }
                                </Text>
                                {!isArchive && <Text style={styles.progressValue}>{Math.round(progress)}%</Text>}
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min(progress, 100)}%` },
                                    isArchive && { backgroundColor: '#27ae60' }
                                ]} />
                            </View>
                        </View>
                    )
                )}

                {!isGeneral && !isArchive && decree.type === 'EXAM' && isTodayOrPast && (
                    <MedievalButton
                        title="CONCLUIR EXAMEN"
                        onPress={async () => {
                            await updateDecree(decree.id, {
                                status: 'COMPLETED',
                                current_quantity: decree.target_quantity,
                                completed_at: new Date().toISOString()
                            });
                        }}
                        style={{ marginTop: 10, paddingVertical: 6, minHeight: 32 }}
                    />
                )}

                {decree.due_date && !isArchive && (
                    <Text style={styles.dueDate}>
                        Fecha: {new Date(decree.due_date).toLocaleDateString()}
                    </Text>
                )}

                {isArchive && decree.completed_at && (
                    <Text style={styles.completionDate}>
                        Sellado el: {new Date(decree.completed_at).toLocaleDateString()}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.topHeader}>
                <Text style={styles.headerTitle}>GRAN SALA DEL TRONO</Text>
                <Text style={styles.headerSubtitle}>"El destino del reino se escribe aquí"</Text>
            </View>

            {/* Tab Selector */}
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
                    <Crown size={20} color={viewMode === 'ACTIVE' ? '#FFD700' : '#8b4513'} />
                    <Text style={[styles.tabBtnText, viewMode === 'ACTIVE' && styles.tabBtnTextActive]}>DECRETOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabBtn}
                    onPress={() => horizontalScrollRef.current?.scrollTo({ x: width, animated: true })}
                >
                    <History size={20} color={viewMode === 'ARCHIVE' ? '#FFD700' : '#8b4513'} />
                    <Text style={[styles.tabBtnText, viewMode === 'ARCHIVE' && styles.tabBtnTextActive]}>MAUSOLEO</Text>
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
                    setViewMode(offsetX >= width / 2 ? 'ARCHIVE' : 'ACTIVE');
                }}
            >
                {/* HABITS (PROTOCOLOS) PANE */}
                <ScrollView style={{ width }} contentContainerStyle={styles.scrollContent}>
                    {/* Protocolos Vigentes Section */}
                    <ParchmentCard style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>PROTOCOLOS VIGENTES</Text>
                        </View>

                        {habits?.loading && (habits?.todayLogs || []).length === 0 ? (
                            <ActivityIndicator size="small" color="#d4af37" />
                        ) : (habits?.todayLogs || []).length > 0 ? (
                            (habits?.todayLogs || []).map(log => {
                                const ritual = log.definition;
                                if (!ritual) return null;

                                const isMercenary = ritual.schedule_type === 'weekly_quota';

                                return (
                                    <TouchableOpacity
                                        key={log.id}
                                        style={styles.decreeItem}
                                        onPress={() => handleRitualPress(ritual)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.decreeHeader}>
                                            <TouchableOpacity
                                                onPress={() => !ritual.activity_type && habits.toggleHabit(log.id, !log.completed)}
                                                disabled={!!ritual.activity_type}
                                                style={{ opacity: ritual.activity_type ? 0.6 : 1, marginTop: 12 }}
                                            >
                                                {log.completed ? (
                                                    <CheckSquare size={24} color="#27ae60" />
                                                ) : ritual.activity_type ? (
                                                    <Clock size={24} color="#8b4513" />
                                                ) : (
                                                    <Square size={24} color="#3d2b1f" />
                                                )}
                                            </TouchableOpacity>

                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                <Text style={styles.decreeTitle}>{ritual.title}</Text>

                                                {ritual.activity_type && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                        {React.createElement(getZoneInfo(ritual).icon, { size: 18, color: getZoneInfo(ritual).color })}
                                                        <Text style={{ fontSize: 18, color: getZoneInfo(ritual).color, marginLeft: 8, fontWeight: '900', letterSpacing: 0.5 }}>
                                                            {getZoneInfo(ritual).label.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                )}

                                                <Text style={{ fontSize: 11, color: '#8b4513', fontWeight: 'bold', opacity: 0.6, marginTop: 4 }}>
                                                    {ritual.schedule_type === 'daily' ? 'MONJE' : ritual.schedule_type === 'specific_days' ? 'GUARDIA' : 'MERCENARIO'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Progress Bar for Time-based or Multi-step rituals */}
                                        {ritual.target_value > 1 && (
                                            <View style={{ marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <Text style={{ fontSize: 10, color: '#8b4513', fontStyle: 'italic' }}>Progreso Diario</Text>
                                                    <Text style={{ fontSize: 10, color: '#3d2b1f', fontWeight: 'bold' }}>
                                                        {log.current_value} / {log.target_value} {ritual.unit === 'MINUTES' ? 'min' : ritual.unit === 'PAGES' ? 'págs' : 'ses.'}
                                                    </Text>
                                                </View>
                                                <View style={styles.examProgressBarBg}>
                                                    <View
                                                        style={[
                                                            styles.examProgressBarFill,
                                                            {
                                                                width: `${Math.min(100, (log.current_value / log.target_value) * 100)}%`,
                                                                backgroundColor: log.completed ? '#27ae60' : '#d4af37'
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {isMercenary && (
                                            <View style={styles.mercenarySlots}>
                                                {Array.from({ length: ritual.weekly_target }).map((_, i) => {
                                                    const previousCompletions = (ritual.current_streak || 0) - (log.completed ? 1 : 0);
                                                    const currentCycleCompletions = previousCompletions % ritual.weekly_target;
                                                    const isFilled = i < currentCycleCompletions || (log.completed && i === currentCycleCompletions);

                                                    return (
                                                        <View
                                                            key={i}
                                                            style={[
                                                                styles.mercenarySlot,
                                                                isFilled ? styles.mercenarySlotFilled : null
                                                            ]}
                                                        />
                                                    );
                                                })}
                                            </View>
                                        )}

                                        <View style={styles.streakContainer}>
                                            <Trophy size={10} color="#d4af37" />
                                            <Text style={styles.streakText}>Racha: {ritual.current_streak} días</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ScrollIcon size={40} color="#8b4513" opacity={0.4} />
                                <Text style={styles.emptyText}>Sin protocolos para hoy. Dicta nuevas leyes de disciplina en el Quickadd.</Text>
                            </View>
                        )}
                    </ParchmentCard>

                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Sword size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>ASUNTOS PENDIENTES</Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="small" color="#d4af37" />
                        ) : activeDecrees.length > 0 ? (
                            activeDecrees.map(d => renderDecree(d))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ScrollIcon size={40} color="#8b4513" opacity={0.4} />
                                <Text style={styles.emptyText}>El reino goza de paz. Pulsa el Quickadd para dictar nuevos mandatos.</Text>
                            </View>
                        )}
                    </ParchmentCard>

                    {/* Quick Access Buttons */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* ARCHIVE PANE (MAUSOLEO) */}
                <ScrollView style={{ width }} contentContainerStyle={styles.scrollContent}>
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Trophy size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>MAUSOLEO DE LOGROS</Text>
                        </View>

                        {completedDecrees.length > 0 ? (
                            completedDecrees.map(d => renderDecree(d, true))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Shield size={40} color="#8b4513" opacity={0.4} />
                                <Text style={styles.emptyText}>Aún no hay crónicas de victorias en estos muros...</Text>
                            </View>
                        )}
                    </ParchmentCard>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </ScrollView>

            <RoyalDecreeModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={addDecree}
            />
        </View >
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0f0a',
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
        backgroundColor: 'rgba(61, 43, 31, 0.2)',
        margin: 15,
        borderRadius: 12,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: 'rgba(61, 43, 31, 0.6)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        zIndex: 1,
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8b4513',
        marginLeft: 8,
    },
    tabBtnTextActive: {
        color: '#FFD700',
    },
    scrollContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    sectionCard: {
        width: width * 0.92,
        marginBottom: 20,
        minHeight: 150,
    },
    sectionCardContent: {
        padding: 12, // More compact
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    decreeItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
    },
    decreeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    decreeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        flex: 1,
    },
    decreeDesc: {
        fontSize: 13,
        color: '#5d4037',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    completedBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#27ae60',
        marginLeft: 3,
    },
    progressContainer: {
        marginTop: 5,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    progressValue: {
        fontSize: 12,
        color: '#3d2b1f',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(61, 43, 31, 0.15)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#d4af37',
    },
    completionDate: {
        fontSize: 9,
        color: '#8b4513',
        marginTop: 6,
        textAlign: 'right',
        opacity: 0.7,
    },
    dueDate: {
        fontSize: 10,
        color: '#8b4513',
        fontStyle: 'italic',
        marginTop: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#8b4513',
        marginTop: 15,
        fontSize: 13,
        paddingHorizontal: 20,
    },
    examCountdownWrapper: {
        marginTop: 10,
        backgroundColor: 'rgba(139, 69, 19, 0.05)',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.1)',
    },
    countdownLabel: {
        fontSize: 11,
        color: '#8b4513',
        marginLeft: 6,
        fontStyle: 'italic',
    },
    countdownValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    examProgressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
        marginTop: 8,
        overflow: 'hidden',
    },
    examProgressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    mercenarySlots: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 5,
    },
    mercenarySlot: {
        width: 15,
        height: 15,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#3d2b1f',
        marginRight: 6,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
    },
    mercenarySlotFilled: {
        backgroundColor: '#d4af37',
        borderColor: '#8b4513',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    streakText: {
        fontSize: 10,
        color: '#d4af37',
        marginLeft: 5,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
});
