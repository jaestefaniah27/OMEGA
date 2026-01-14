import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { X, Sword, BookOpen, Music, Target, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DecreeType, DecreeUnit } from '../types/supabase';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

interface RoyalDecreeModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (decree: any) => Promise<void>;
}

export const RoyalDecreeModal: React.FC<RoyalDecreeModalProps> = ({ visible, onClose, onSave }) => {
    const { theatre } = useGame();
    const { activities } = theatre;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<DecreeType>('GENERAL');
    const [targetQuantity, setTargetQuantity] = useState('1');
    const [isRepetitive, setIsRepetitive] = useState(false);
    const [minTime, setMinTime] = useState('0');
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Repetitive Logic
    const [freq, setFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' | 'BIWEEKLY' | 'EVERY_2_DAYS'>('DAILY');
    const [customDays, setCustomDays] = useState<number[]>([]);
    const [librarySubType, setLibrarySubType] = useState<'STUDY' | 'READING'>('STUDY');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleSave = async () => {
        let finalTitle = title;
        let finalDescription = description;
        let finalQuantity = parseInt(targetQuantity) || 1;

        if (type === 'BARRACKS') {
            finalTitle = "Mandato de la Forja";
            finalDescription = `Completar ${finalQuantity} sesiones de entrenamiento.`;
        } else if (type === 'LIBRARY') {
            const isReading = librarySubType === 'READING';
            finalTitle = isReading ? "Hábito del Lector" : "Erudición Real";
            const timeDesc = parseInt(minTime) > 0 ? ` de al menos ${minTime} min` : "";
            finalDescription = isReading 
                ? `Alimentar el alma con la lectura${timeDesc}.` 
                : `Fortalecer la mente con el estudio${timeDesc}.`;
        } else if (type === 'THEATRE') {
            const activity = activities.find(a => a.id === selectedActivityId);
            finalTitle = `Maestría: ${activity?.name || 'Actividad'}`;
            const timeDesc = parseInt(minTime) > 0 ? ` de al menos ${minTime} min` : "";
            finalDescription = `Cumplir el ritual${timeDesc}.`;
        }

        setLoading(true);
        try {
            await onSave({
                title: finalTitle,
                description: finalDescription,
                type,
                target_quantity: finalQuantity,
                unit: 'SESSIONS',
                required_activity_tag: type === 'THEATRE' ? selectedActivityId : 
                                       type === 'LIBRARY' ? librarySubType : null,
                due_date: selectedDate ? selectedDate.toISOString() : null,
                recurrence: {
                    min_time: parseInt(minTime) || 0,
                    is_repetitive: isRepetitive,
                    frequency: isRepetitive ? freq : null,
                    days: (isRepetitive && freq === 'CUSTOM') ? customDays : 
                           (isRepetitive && freq === 'WEEKLY') ? [new Date().getDay()] : null,
                    interval: freq === 'EVERY_2_DAYS' ? 2 : (freq === 'BIWEEKLY' ? 14 : 1)
                },
                status: 'PENDING'
            });
            resetAndClose();
        } catch (error) {
            console.error('Error saving decree:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setTitle('');
        setDescription('');
        setType('GENERAL');
        setTargetQuantity('1');
        setIsRepetitive(false);
        setMinTime('0');
        setSelectedActivityId('');
        setDueDate('');
        setFreq('DAILY');
        setCustomDays([]);
        setLibrarySubType('STUDY');
        setSelectedDate(null);
        onClose();
    };

    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const types: { label: string; value: DecreeType; icon: any }[] = [
        { label: 'General', value: 'GENERAL', icon: Target },
        { label: 'Forja', value: 'BARRACKS', icon: Sword },
        { label: 'Biblioteca', value: 'LIBRARY', icon: BookOpen },
        { label: 'Teatro', value: 'THEATRE', icon: Music },
    ];

    const renderFields = () => {
        switch (type) {
            case 'GENERAL':
                return (
                    <>
                        <Text style={styles.label}>Título del Mandato</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Ej: Caminar 10km"
                        />
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Instrucciones del Rey..."
                            multiline
                        />
                        {renderRecurrenceFields()}
                    </>
                );
            case 'BARRACKS':
                return renderRecurrenceFields();
            case 'LIBRARY':
                return (
                    <>
                        <Text style={styles.label}>Naturaleza de la Tarea</Text>
                        <View style={styles.asiduidadTabs}>
                            <TouchableOpacity
                                style={[styles.tab, librarySubType === 'STUDY' && styles.tabActive]}
                                onPress={() => setLibrarySubType('STUDY')}
                            >
                                <Text style={[styles.tabText, librarySubType === 'STUDY' && styles.tabTextActive]}>Estudio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, librarySubType === 'READING' && styles.tabActive]}
                                onPress={() => setLibrarySubType('READING')}
                            >
                                <Text style={[styles.tabText, librarySubType === 'READING' && styles.tabTextActive]}>Lectura</Text>
                            </TouchableOpacity>
                        </View>
                        {renderRecurrenceFields()}
                        <Text style={styles.label}>Tiempo Mínimo (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            value={minTime}
                            onChangeText={setMinTime}
                            keyboardType="numeric"
                            placeholder="0 = Sin mínimo"
                        />
                    </>
                );
            case 'THEATRE':
                return (
                    <>
                        <Text style={styles.label}>Seleccionar Actividad</Text>
                        <View style={styles.activityGrid}>
                            {activities.map(act => (
                                <TouchableOpacity
                                    key={act.id}
                                    style={[styles.activityItem, selectedActivityId === act.id && styles.activityItemActive]}
                                    onPress={() => setSelectedActivityId(act.id)}
                                >
                                    <Text style={[styles.activityText, selectedActivityId === act.id && styles.activityTextActive]}>
                                        {act.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {renderRecurrenceFields()}
                        <Text style={styles.label}>Tiempo Mínimo (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            value={minTime}
                            onChangeText={setMinTime}
                            keyboardType="numeric"
                            placeholder="0 = Sin mínimo"
                        />
                    </>
                );
            default:
                return null;
        }
    };

    const toggleDay = (day: number) => {
        if (customDays.includes(day)) {
            setCustomDays(customDays.filter(d => d !== day));
        } else {
            setCustomDays([...customDays, day].sort());
        }
    };

    const renderRecurrenceFields = () => (
        <View style={styles.section}>
            <Text style={styles.label}>Asiduidad</Text>
            <View style={styles.asiduidadTabs}>
                <TouchableOpacity
                    style={[styles.tab, !isRepetitive && styles.tabActive]}
                    onPress={() => {
                        setIsRepetitive(false);
                        setTargetQuantity('1');
                    }}
                >
                    <Text style={[styles.tabText, !isRepetitive && styles.tabTextActive]}>Una vez</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, isRepetitive && styles.tabActive]}
                    onPress={() => setIsRepetitive(true)}
                >
                    <Text style={[styles.tabText, isRepetitive && styles.tabTextActive]}>Repetitivo</Text>
                </TouchableOpacity>
            </View>

            {isRepetitive && (
                <>
                    <View style={styles.freqGrid}>
                        {[
                            { label: 'Diario', value: 'DAILY' },
                            { label: 'C/2 días', value: 'EVERY_2_DAYS' },
                            { label: 'Semanal', value: 'WEEKLY' },
                            { label: 'C/2 sem.', value: 'BIWEEKLY' },
                            { label: 'Mensual', value: 'MONTHLY' },
                            { label: 'Custom', value: 'CUSTOM' },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={[styles.freqItem, freq === item.value && styles.freqItemActive]}
                                onPress={() => setFreq(item.value as any)}
                            >
                                <Text style={[styles.freqText, freq === item.value && styles.freqTextActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {freq === 'CUSTOM' && (
                        <View style={styles.daysRow}>
                            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.dayCircle, customDays.includes(idx) && styles.dayCircleActive]}
                                    onPress={() => toggleDay(idx)}
                                >
                                    <Text style={[styles.dayText, customDays.includes(idx) && styles.dayTextActive]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Fin de repetición (Opcional)</Text>
                            <TouchableOpacity 
                                style={styles.dateSelector} 
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={18} color="#8b4513" />
                                <Text style={styles.dateText}>
                                    {selectedDate ? selectedDate.toLocaleDateString() : 'Para siempre'}
                                </Text>
                                {selectedDate && (
                                    <TouchableOpacity 
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSelectedDate(null);
                                        }}
                                        style={styles.clearDate}
                                    >
                                        <X size={14} color="#8b4513" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </>
            )}
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <ParchmentCard style={styles.modalCard}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📜 FORJAR DECRETO</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#3d2b1f" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Esfera de Influencia</Text>
                        <View style={styles.typeGrid}>
                            {types.map((t) => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[styles.typeItem, type === t.value && styles.typeItemActive]}
                                    onPress={() => setType(t.value)}
                                >
                                    <t.icon size={18} color={type === t.value ? '#fff' : '#3d2b1f'} />
                                    <Text style={[styles.typeLabel, type === t.value && styles.typeLabelActive]}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        {renderFields()}

                        <MedievalButton
                            title={loading ? "SELLANDO..." : "SELLAR DECRETO"}
                            onPress={handleSave}
                            style={styles.saveButton}
                        />
                    </ScrollView>
                </ParchmentCard>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        letterSpacing: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 12,
        color: '#3d2b1f',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        marginVertical: 15,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    typeItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    typeItemActive: {
        backgroundColor: '#3d2b1f',
    },
    typeLabel: {
        fontSize: 11,
        color: '#3d2b1f',
        marginLeft: 6,
        fontWeight: '600',
    },
    typeLabelActive: {
        color: '#fff',
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    activityItem: {
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
    },
    activityItemActive: {
        backgroundColor: '#d4af37',
        borderColor: '#8b4513',
    },
    activityText: {
        fontSize: 12,
        color: '#3d2b1f',
    },
    activityTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    section: {
        marginTop: 5,
    },
    asiduidadTabs: {
        flexDirection: 'row',
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        borderRadius: 10,
        padding: 3,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: 'rgba(61, 43, 31, 0.15)',
    },
    tabText: {
        fontSize: 12,
        color: '#8b4513',
    },
    tabTextActive: {
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        marginTop: 25,
        marginBottom: 10,
    },
    freqGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    freqItem: {
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.1)',
    },
    freqItemActive: {
        backgroundColor: '#3d2b1f',
        borderColor: '#3d2b1f',
    },
    freqText: {
        fontSize: 10,
        color: '#8b4513',
    },
    freqTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        padding: 8,
        borderRadius: 10,
    },
    dayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCircleActive: {
        backgroundColor: '#d4af37',
    },
    dayText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    dayTextActive: {
        color: '#fff',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
    },
    dateText: {
        fontSize: 14,
        color: '#3d2b1f',
        marginLeft: 10,
        flex: 1,
    },
    clearDate: {
        padding: 4,
    }
});
