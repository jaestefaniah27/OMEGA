import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform,
    DeviceEventEmitter
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ParchmentCard, MedievalButton, ScreenWrapper } from '..';
import {
    ChevronLeft,
    ChevronRight,
    Scroll as ScrollIcon,
    Trophy,
    Square,
    Map as MapIcon,
    Flame
} from 'lucide-react-native';
import { useGame, RoyalDecree } from '@omega/logic';
import { useNavigation } from '@react-navigation/native';
import { RoyalDecreeModal } from '../components/RoyalDecreeModal';

// Configure Calendar Locale
LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const { width } = Dimensions.get('window');

export const WarTableScreen: React.FC = () => {
    const navigation = useNavigation();
    const { castle } = useGame();
    const { decrees, updateDecree, addDecree } = castle;
    const [modalVisible, setModalVisible] = useState(false);

    // Identify decrees that have already been expanded into separate records
    const parentIds = useMemo(() => {
        const set = new Set<string>();
        decrees.forEach(d => {
            if (d.parent_id) set.add(d.parent_id);
        });
        return set;
    }, [decrees]);


    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
    const [calendarKey, setCalendarKey] = useState(0);

    // --- QUICK ADD HUD LISTENER ---
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_QUICK_ADD', () => {
            setModalVisible(true);
        });
        return () => sub.remove();
    }, []);

    const isDecreeActiveOnDate = (decree: RoyalDecree, dateString: string) => {
        // Strict string-based comparison to avoid Timezone shifts (YYYY-MM-DD)
        const checkStr = dateString;
        const startStr = decree.created_at.split('T')[0];
        const endStr = decree.due_date ? decree.due_date.split('T')[0] : null;

        // Basic range check
        if (checkStr < startStr) return false;
        if (endStr && checkStr > endStr) return false;

        const recurrence = decree.recurrence as any;

        // NEW LOGIC: If this decree has separate instances already created, 
        // we disable the virtual repetition so we don't see duplicates.
        const isParentWithInstances = parentIds.has(decree.id);
        const isChild = !!decree.parent_id;

        if (isParentWithInstances || isChild || !recurrence || !recurrence.is_repetitive) {
            // One-shot or specific instance: only show on its target date
            const targetDate = endStr || startStr;
            return checkStr === targetDate;
        }

        // --- Fallback: Virtual Repetition (only if not "exploded" into separate records) ---
        // Using midday for Date objects to prevent TZ shifts during getDay()
        const checkDate = new Date(dateString + 'T12:00:00');
        const startDate = new Date(decree.created_at);
        startDate.setHours(0, 0, 0, 0);

        const freq = recurrence.frequency;
        if (freq === 'DAILY') return true;

        const dayOfWeek = checkDate.getDay();
        if (freq === 'WEEKLY' || freq === 'CUSTOM') {
            return recurrence.days?.includes(dayOfWeek);
        }

        const diffTime = checkDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (freq === 'EVERY_2_DAYS') return diffDays % 2 === 0;
        if (freq === 'BIWEEKLY') return diffDays % 14 === 0;

        return false;
    };

    // Calculate marked dates
    const markedDates = useMemo(() => {
        const marks: any = {};

        const windowStart = new Date(selectedDate);
        windowStart.setMonth(windowStart.getMonth() - 6);
        const windowEnd = new Date(selectedDate);
        windowEnd.setMonth(windowEnd.getMonth() + 6);

        // Include everything that could possibly be visible
        const relevantDecrees = decrees.filter(d => {
            if (d.due_date) {
                const dd = new Date(d.due_date);
                return dd >= windowStart && dd <= windowEnd;
            }
            // If it's repetitive or has no due date, it's always relevant for marking
            return true;
        });

        // We calculate marks for a window around the selected date (approx 6 months)
        const centerDate = new Date(selectedDate);
        for (let i = -180; i <= 180; i++) {
            const d = new Date(centerDate);
            d.setDate(d.getDate() + i);
            const dStr = d.toISOString().split('T')[0];
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            let hasActiveDecree = false;
            let dotColor = '#d4af37';

            for (const decree of relevantDecrees) {
                if (isDecreeActiveOnDate(decree, dStr)) {
                    hasActiveDecree = true;

                    const isCompleted = decree.status === 'COMPLETED';
                    const isFailed = decree.status === 'FAILED';
                    const completedAt = decree.completed_at ? new Date(decree.completed_at).toISOString().split('T')[0] : null;
                    const isRepetitive = decree.recurrence && (decree.recurrence as any).is_repetitive;

                    // Color logic
                    if (isCompleted) {
                        if (isRepetitive) {
                            if (completedAt === dStr) {
                                dotColor = '#27ae60';
                            } else {
                                dotColor = '#d4af37';
                            }
                        } else {
                            dotColor = '#27ae60';
                        }
                    } else if (isFailed) {
                        dotColor = '#e74c3c'; // Red for failed
                    } else {
                        dotColor = '#d4af37'; // Gold for pending
                    }
                }
            }

            const isSelected = dStr === selectedDate;

            if (hasActiveDecree || isSelected || isWeekend) {
                marks[dStr] = {
                    marked: hasActiveDecree,
                    dotColor: dotColor,
                    selected: isSelected,
                    selectedColor: '#3d2b1f',
                    selectedTextColor: '#FFD700',
                    textColor: isSelected ? '#FFD700' : (isWeekend ? '#555555' : '#3d2b1f')
                };
            }
        }

        return marks;
    }, [decrees, selectedDate, parentIds]);

    // Filter decrees for selected day
    const dayDecrees = useMemo(() => {
        return decrees.filter(d => isDecreeActiveOnDate(d, selectedDate));
    }, [decrees, selectedDate]);

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

    const renderDecreeItem = (decree: RoyalDecree) => {
        const isCompleted = decree.status === 'COMPLETED';
        const progress = (decree.current_quantity / (decree.target_quantity || 1)) * 100;

        return (
            <View key={decree.id} style={styles.decreeItem}>
                <View style={styles.decreeHeader}>
                    {decree.type === 'GENERAL' ? (
                        <TouchableOpacity onPress={() => toggleGeneralDecree(decree)}>
                            {isCompleted ? (
                                <Trophy size={20} color="#27ae60" />
                            ) : (
                                <Square size={20} color="#3d2b1f" />
                            )}
                        </TouchableOpacity>
                    ) : (
                        <ScrollIcon size={20} color="#3d2b1f" />
                    )}
                    <Text style={[styles.decreeTitle, isCompleted && styles.textCompleted]}>
                        {decree.title}
                    </Text>
                    {isCompleted && (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>SELLADO</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.decreeDesc}>{decree.description}</Text>

                {decree.target_quantity > 1 && (
                    <View style={styles.progressSection}>
                        <View style={styles.miniProgress}>
                            <View style={[styles.miniProgressBar, { width: `${Math.min(progress, 100)}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {decree.unit === 'MINUTES'
                                ? `${decree.current_quantity}m / ${decree.target_quantity}m`
                                : `${decree.current_quantity} / ${decree.target_quantity} ses.`
                            } ({Math.round(progress)}%)
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const handleDayChange = (direction: 'next' | 'prev') => {
        const current = new Date(selectedDate);
        if (direction === 'next') {
            current.setDate(current.getDate() + 1);
        } else {
            current.setDate(current.getDate() - 1);
        }
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    const [touchStartX, setTouchStartX] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    return (
        <ScreenWrapper background="#1a0f0a">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>MESA DE GUERRA</Text>
                        <Text style={styles.headerSubtitle}>Crónicas del Destino</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.todayButton}
                        onPress={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setSelectedDate(today);
                            setCurrentMonth(today);
                            setCalendarKey(prev => prev + 1);
                        }}
                    >
                        <Text style={styles.todayButtonText}>HOY</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    scrollEnabled={scrollEnabled}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Calendar Section */}
                    <ParchmentCard style={styles.calendarCard}>
                        <Calendar
                            key={calendarKey}
                            current={currentMonth}
                            onDayPress={day => {
                                setSelectedDate(day.dateString);
                                setCurrentMonth(day.dateString);
                            }}
                            onMonthChange={month => setCurrentMonth(month.dateString)}
                            markedDates={markedDates}
                            firstDay={1}
                            enableSwipeMonths={true}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#8b4513',
                                todayTextColor: '#e67e22',
                                dayTextColor: '#3d2b1f',
                                textDisabledColor: 'rgba(61, 43, 31, 0.3)',
                                dotColor: '#d4af37',
                                arrowColor: '#8b4513',
                                monthTextColor: '#3d2b1f',
                                indicatorColor: '#3d2b1f',
                                textDayFontWeight: 'bold',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: 'bold',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                        />
                    </ParchmentCard>

                    {/* Selected Day Agenda */}
                    <View
                        style={styles.agendaSection}
                        onTouchStart={(e) => {
                            setTouchStartX(e.nativeEvent.pageX);
                            setTouchStartY(e.nativeEvent.pageY);
                        }}
                        onTouchMove={(e) => {
                            const dx = Math.abs(e.nativeEvent.pageX - touchStartX);
                            const dy = Math.abs(e.nativeEvent.pageY - touchStartY);
                            // If horizontal move is dominant and significant, lock vertical scroll
                            if (dx > dy && dx > 10) {
                                setScrollEnabled(false);
                            }
                        }}
                        onTouchEnd={(e) => {
                            const dx = e.nativeEvent.pageX - touchStartX;
                            setScrollEnabled(true);
                            if (Math.abs(dx) > 60) {
                                if (dx > 0) handleDayChange('prev');
                                else handleDayChange('next');
                            }
                        }}
                        onTouchCancel={() => setScrollEnabled(true)}
                    >
                        <View style={styles.agendaHeader}>
                            <Flame size={18} color="#FFD700" />
                            <Text style={styles.agendaTitle}>
                                {selectedDate === new Date().toISOString().split('T')[0] ? 'ÓRDENES PARA HOY' : `ÓRDENES DEL ${new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}
                            </Text>
                        </View>

                        {dayDecrees.length > 0 ? (
                            dayDecrees.map(renderDecreeItem)
                        ) : (
                            <View style={styles.emptyAgenda}>
                                <MapIcon size={40} color="rgba(255, 215, 0, 0.2)" />
                                <Text style={styles.emptyText}>No hay mandatos reales para este día en las crónicas.</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
                <RoyalDecreeModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={addDecree}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0f0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#2d1a12',
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
        justifyContent: 'space-between',
    },
    todayButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        minWidth: 50,
        alignItems: 'center',
    },
    todayButtonText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#d4af37',
        fontStyle: 'italic',
    },
    scrollContent: {
        padding: 15,
    },
    calendarCard: {
        padding: 5,
        marginBottom: 20,
    },
    agendaSection: {
        marginTop: 10,
    },
    agendaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 215, 0, 0.2)',
        paddingBottom: 8,
    },
    agendaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: 10,
        letterSpacing: 1,
    },
    decreeItem: {
        backgroundColor: 'rgba(61, 43, 31, 0.3)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    decreeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    decreeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f3e5ab',
        marginLeft: 10,
        flex: 1,
    },
    textCompleted: {
        color: 'rgba(39, 174, 96, 0.6)',
        textDecorationLine: 'line-through',
    },
    statusBadge: {
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(39, 174, 96, 0.4)',
    },
    statusBadgeText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#2ecc71',
    },
    decreeDesc: {
        fontSize: 13,
        color: 'rgba(243, 229, 171, 0.7)',
        marginLeft: 30,
        fontStyle: 'italic',
    },
    progressSection: {
        marginLeft: 30,
        marginTop: 10,
    },
    miniProgress: {
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniProgressBar: {
        height: '100%',
        backgroundColor: '#d4af37',
    },
    progressText: {
        fontSize: 10,
        color: 'rgba(212, 175, 55, 0.6)',
        marginTop: 4,
        fontWeight: 'bold',
    },
    emptyAgenda: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        borderRadius: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(212, 175, 55, 0.1)',
    },
    emptyText: {
        color: 'rgba(212, 175, 55, 0.4)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 30,
        fontStyle: 'italic',
    },
    mapBtn: {
        marginTop: 30,
    }
});
