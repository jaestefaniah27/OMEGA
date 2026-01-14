import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ParchmentCard, MedievalButton } from '@omega/ui';
import { 
    ChevronLeft, 
    ChevronRight, 
    Scroll as ScrollIcon,
    Trophy,
    Square,
    Map as MapIcon,
    Flame
} from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { useNavigation } from '@react-navigation/native';
import { RoyalDecree } from '../types/supabase';

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
    const { decrees, updateDecree } = castle;
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const isDecreeActiveOnDate = (decree: RoyalDecree, dateString: string) => {
        const checkDate = new Date(dateString);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(decree.created_at);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = decree.due_date ? new Date(decree.due_date) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999); // Inclusion till end of day

        // If it's completed, we still want to show it on the calendar in its active days
        // but maybe with a different style or just as it was.
        
        // Basic range check
        if (checkDate < startDate) return false;
        if (endDate && checkDate > endDate) return false;

        const recurrence = decree.recurrence as any;
        if (!recurrence || !recurrence.is_repetitive) {
            // One-shot: only show on target date (due_date)
            return endDate ? checkDate.toDateString() === endDate.toDateString() : checkDate.toDateString() === startDate.toDateString();
        }

        // Repetitive logic
        const freq = recurrence.frequency;
        if (freq === 'DAILY') return true;
        
        const dayOfWeek = checkDate.getDay();
        if (freq === 'WEEKLY' || freq === 'CUSTOM') {
            return recurrence.days?.includes(dayOfWeek);
        }

        const diffTime = checkDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (freq === 'EVERY_2_DAYS') {
            return diffDays % 2 === 0;
        }

        if (freq === 'BIWEEKLY') {
            return diffDays % 14 === 0;
        }

        return false;
    };

    // Calculate marked dates
    const markedDates = useMemo(() => {
        const marks: any = {};
        
        // We calculate marks for a window around the selected date (approx 2 months)
        const centerDate = new Date(selectedDate);
        for (let i = -45; i <= 45; i++) {
            const d = new Date(centerDate);
            d.setDate(d.getDate() + i);
            const dStr = d.toISOString().split('T')[0];
            
            for (const decree of decrees) {
                if (isDecreeActiveOnDate(decree, dStr)) {
                    if (!marks[dStr]) {
                        marks[dStr] = { 
                            marked: true, 
                            dotColor: (dStr === new Date().toISOString().split('T')[0] && decree.status === 'COMPLETED') ? '#27ae60' : '#d4af37' 
                        };
                    }
                    // If at least one pending decree is active on this day, keep it yellow
                    if (decree.status === 'PENDING') {
                        marks[dStr].dotColor = '#d4af37';
                    }
                }
            }
        }

        // Highlight selected date
        marks[selectedDate] = {
            ...marks[selectedDate],
            selected: true,
            selectedColor: '#3d2b1f',
            selectedTextColor: '#FFD700'
        };

        return marks;
    }, [decrees, selectedDate]);

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>MESA DE GUERRA</Text>
                    <Text style={styles.headerSubtitle}>Crónicas del Destino</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Calendar Section */}
                <ParchmentCard style={styles.calendarCard}>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            textSectionTitleColor: '#8b4513',
                            selectedDayBackgroundColor: '#3d2b1f',
                            selectedDayTextColor: '#FFD700',
                            todayTextColor: '#e67e22',
                            dayTextColor: '#3d2b1f',
                            textDisabledColor: 'rgba(61, 43, 31, 0.3)',
                            dotColor: '#d4af37',
                            selectedDotColor: '#FFD700',
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
                <View style={styles.agendaSection}>
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
        </View>
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
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#2d1a12',
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
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
