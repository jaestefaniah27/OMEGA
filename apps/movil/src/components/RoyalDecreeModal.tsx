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
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { X, Sword, BookOpen, Music, Target, Calendar, Check } from 'lucide-react-native';
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
    const { library, theatre } = useGame();
    const { subjects, updateSubject } = library;
    const { activities } = theatre;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<DecreeType>('GENERAL');
    const [targetQuantity, setTargetQuantity] = useState('1');
    const [isRepetitive, setIsRepetitive] = useState(false);
    const [minTime, setMinTime] = useState('0');
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [calendarExport, setCalendarExport] = useState(false);
    const [loading, setLoading] = useState(false);

    // Exam Related
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [examTime, setExamTime] = useState('');
    const [examPlace, setExamPlace] = useState('');
    const [examWeight, setExamWeight] = useState(100);
    const [otherExamWeights, setOtherExamWeights] = useState<{[key: string]: number}>({});

    // Repetitive Logic
    const [freq, setFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' | 'BIWEEKLY' | 'EVERY_2_DAYS'>('DAILY');
    const [customDays, setCustomDays] = useState<number[]>([]);
    const [librarySubType, setLibrarySubType] = useState<'STUDY' | 'READING' | 'EXAM'>('STUDY');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSave = async () => {
        let finalTitle = title;
        let finalDescription = description;
        let finalQuantity = parseInt(targetQuantity) || 1;

        const finalUnit: DecreeUnit = (type === 'LIBRARY' || type === 'THEATRE' || type === 'BARRACKS') ? 'MINUTES' : 'SESSIONS';
        
        if (type === 'BARRACKS') {
            finalTitle = "Mandato de la Forja";
            finalDescription = `Entrenar un total de ${finalQuantity} minutos.`;
        } else if (type === 'LIBRARY') {
            if (librarySubType === 'EXAM') {
                const subject = subjects.find(s => s.id === selectedSubjectId);
                finalTitle = `EXAMEN: ${subject?.name || 'Asignatura'}`;
                finalDescription = title || `Examen en ${examPlace || 'el Reino'}`;
            } else {
                const isReading = librarySubType === 'READING';
                finalTitle = isReading ? "Hábito del Lector" : "Erudición Real";
                finalDescription = isReading 
                    ? `Leer un total de ${finalQuantity} minutos.`
                    : `Estudiar un total de ${finalQuantity} minutos.`;
            }
        } else if (type === 'THEATRE') {
            const activity = activities.find(a => a.id === selectedActivityId);
            finalTitle = `Maestría: ${activity?.name || 'Actividad'}`;
            finalDescription = `Ejercer maestría por ${finalQuantity} minutos.`;
        }

        setLoading(true);
        try {
            const decreeId = generateUUID();
            const isExam = type === 'LIBRARY' && librarySubType === 'EXAM';
            
            const decreeData = {
                id: decreeId,
                title: finalTitle,
                description: finalDescription,
                type: isExam ? 'EXAM' : type,
                target_quantity: isExam ? 1 : finalQuantity,
                unit: isExam ? 'SESSIONS' : finalUnit,
                due_date: selectedDate ? selectedDate.toISOString() : null,
                recurrence: {
                    min_time: parseInt(minTime) || 0,
                    is_repetitive: isRepetitive,
                    frequency: isRepetitive ? freq : null,
                    days: (isRepetitive && freq === 'CUSTOM') ? customDays : 
                           (isRepetitive && freq === 'WEEKLY') ? [new Date().getDay()] : null,
                    interval: freq === 'EVERY_2_DAYS' ? 2 : (freq === 'BIWEEKLY' ? 14 : 1),
                    time_based: finalUnit === 'MINUTES' && !isExam
                },
                status: 'PENDING',
                calendar_export: calendarExport
            };

            await onSave(decreeData);

            if (isExam && selectedSubjectId) {
                const subject = subjects.find(s => s.id === selectedSubjectId);
                if (subject) {
                    const newExam = {
                        id: generateUUID(),
                        title: title || 'Examen',
                        date: (selectedDate || new Date()).toISOString(),
                        time: examTime,
                        place: examPlace,
                        weight: examWeight,
                        grade: null,
                        is_completed: false,
                        decree_id: decreeId
                    };
                    
                    const updatedExams = [...(subject.exams || [])];
                    // Update other exams' weights as edited in the form
                    const finalExams = updatedExams.map(ex => ({
                        ...ex,
                        weight: otherExamWeights[ex.id] !== undefined ? otherExamWeights[ex.id] : ex.weight
                    }));
                    
                    await updateSubject(selectedSubjectId, {
                        exams: [...finalExams, newExam]
                    });
                }
            }
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
        setDueDate('');
        setFreq('DAILY');
        setCustomDays([]);
        setLibrarySubType('STUDY');
        setSelectedDate(new Date());
        setSelectedSubjectId('');
        setExamTime('');
        setExamPlace('');
        setExamWeight(100);
        setOtherExamWeights({});
        onClose();
        setCalendarExport(false);
    };

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const onTimeChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (date) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            setExamTime(`${hours}:${minutes}`);
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
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Fecha Designada (Opcional)</Text>
                                <TouchableOpacity 
                                    style={styles.dateSelector} 
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Calendar size={18} color="#8b4513" />
                                    <Text style={styles.dateText}>
                                        {selectedDate ? selectedDate.toLocaleDateString() : 'Cualquier día'}
                                    </Text>
                                    {selectedDate && (
                                        <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearDate}>
                                            <X size={14} color="#8b4513" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        {renderRecurrenceFields()}
                    </>
                );
            case 'BARRACKS':
                return (
                    <>
                        <Text style={styles.label}>Tiempo Objetivo (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            value={targetQuantity}
                            onChangeText={setTargetQuantity}
                            keyboardType="numeric"
                            placeholder="Ej: 30"
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Fecha Designada</Text>
                                <TouchableOpacity 
                                    style={styles.dateSelector} 
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Calendar size={18} color="#8b4513" />
                                    <Text style={styles.dateText}>
                                        {selectedDate ? selectedDate.toLocaleDateString() : 'Hoy'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {renderRecurrenceFields()}
                    </>
                );
            case 'LIBRARY':
                return (
                    <>
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
                            <TouchableOpacity
                                style={[styles.tab, librarySubType === 'EXAM' && styles.tabActive]}
                                onPress={() => setLibrarySubType('EXAM')}
                            >
                                <Text style={[styles.tabText, librarySubType === 'EXAM' && styles.tabTextActive]}>Examen</Text>
                            </TouchableOpacity>
                        </View>

                        {librarySubType === 'EXAM' ? (
                            <>
                                <Text style={styles.label}>Asignatura</Text>
                                <View style={styles.activityGrid}>
                                    {subjects.map(sub => (
                                        <TouchableOpacity
                                            key={sub.id}
                                            style={[styles.activityItem, selectedSubjectId === sub.id && styles.activityItemActive, { borderColor: sub.color }]}
                                            onPress={() => handleSubjectSelectForExam(sub.id)}
                                        >
                                            <Text style={[styles.activityText, selectedSubjectId === sub.id && styles.activityTextActive]}>
                                                {sub.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Título del Examen (Ej: Parcial de Álgebra)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Nombre del examen..."
                                />

                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={styles.label}>Fecha (Obligatorio)</Text>
                                        <TouchableOpacity 
                                            style={styles.dateSelector} 
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Calendar size={18} color="#8b4513" />
                                            <Text style={styles.dateText}>
                                                {selectedDate ? selectedDate.toLocaleDateString() : 'Seleccionar...'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Hora (Opcional)</Text>
                                        <TouchableOpacity 
                                            style={styles.dateSelector} 
                                            onPress={() => setShowTimePicker(true)}
                                        >
                                            <Calendar size={18} color="#8b4513" />
                                            <Text style={styles.dateText}>
                                                {examTime || 'Seleccionar...'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.label}>Lugar (Opcional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={examPlace}
                                    onChangeText={setExamPlace}
                                    placeholder="Aula 4B"
                                />

                                <Text style={styles.label}>Factor de Aportación (%)</Text>
                                <View style={styles.weightContainer}>
                                    <View style={styles.weightRow}>
                                        <Text style={styles.weightItemLabel}>Este Examen:</Text>
                                        <TextInput
                                            style={[styles.input, styles.weightInput]}
                                            value={examWeight.toString()}
                                            onChangeText={(val) => setExamWeight(parseInt(val) || 0)}
                                            keyboardType="numeric"
                                        />
                                        <Text style={{color: '#3d2b1f'}}>%</Text>
                                    </View>
                                    
                                    {selectedSubjectId && subjects.find(s => s.id === selectedSubjectId)?.exams?.map(ex => (
                                        <View key={ex.id} style={styles.weightRow}>
                                            <Text style={styles.weightItemLabel}>{ex.title}:</Text>
                                            <TextInput
                                                style={[styles.input, styles.weightInput]}
                                                value={(otherExamWeights[ex.id] ?? ex.weight).toString()}
                                                onChangeText={(val) => {
                                                    setOtherExamWeights({
                                                        ...otherExamWeights,
                                                        [ex.id]: parseInt(val) || 0
                                                    });
                                                }}
                                                keyboardType="numeric"
                                            />
                                            <Text style={{color: '#3d2b1f'}}>%</Text>
                                        </View>
                                    ))}
                                    
                                    <View style={styles.weightTotalRow}>
                                        <Text style={[styles.weightTotalText, (getTotalWeight() !== 100) && {color: '#e74c3c'}]}>
                                            Total: {getTotalWeight()}%
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Tiempo Objetivo (minutos)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={targetQuantity}
                                    onChangeText={setTargetQuantity}
                                    keyboardType="numeric"
                                    placeholder="Ej: 60"
                                />
                                {renderRecurrenceFields()}
                            </>
                        )}
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
                        <Text style={styles.label}>Tiempo Objetivo (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            value={targetQuantity}
                            onChangeText={setTargetQuantity}
                            keyboardType="numeric"
                            placeholder="Ej: 45"
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Fecha Designada</Text>
                                <TouchableOpacity 
                                    style={styles.dateSelector} 
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Calendar size={18} color="#8b4513" />
                                    <Text style={styles.dateText}>
                                        {selectedDate ? selectedDate.toLocaleDateString() : 'Hoy'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {renderRecurrenceFields()}
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

    const handleSubjectSelectForExam = (subjectId: string) => {
        setSelectedSubjectId(subjectId);
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
            const exams = subject.exams || [];
            if (exams.length === 0) {
                setExamWeight(100);
                setOtherExamWeights({});
            } else if (exams.length === 1 && exams[0].weight === 100) {
                setExamWeight(50);
                setOtherExamWeights({ [exams[0].id]: 50 });
            } else {
                // Smart adopt remaining or equal split
                const currentTotal = exams.reduce((acc, ex) => acc + ex.weight, 0);
                if (currentTotal < 100) {
                    setExamWeight(100 - currentTotal);
                    setOtherExamWeights({});
                } else {
                    const newWeight = Math.floor(100 / (exams.length + 1));
                    setExamWeight(newWeight);
                    const newOthers: {[key: string]: number} = {};
                    exams.forEach(ex => newOthers[ex.id] = newWeight);
                    setOtherExamWeights(newOthers);
                }
            }
        }
    };

    const getTotalWeight = () => {
        let total = examWeight;
        if (selectedSubjectId) {
            const subject = subjects.find(s => s.id === selectedSubjectId);
            subject?.exams?.forEach(ex => {
                total += (otherExamWeights[ex.id] ?? ex.weight);
            });
        }
        return total;
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

            {type === 'GENERAL' && (
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Nº de Sesiones</Text>
                        <TextInput
                            style={styles.input}
                            value={targetQuantity}
                            onChangeText={setTargetQuantity}
                            keyboardType="numeric"
                            placeholder="Ej: 1"
                        />
                    </View>
                </View>
            )}

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
                </>
            )}
            
            <View style={{ marginTop: 15 }}>
                <TouchableOpacity 
                    style={[styles.row, { alignItems: 'center' }]} 
                    onPress={() => setCalendarExport(!calendarExport)}
                >
                    <View style={[styles.checkbox, calendarExport && styles.checkboxActive]}>
                        {calendarExport && <Check size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.label, { marginBottom: 0, marginLeft: 10 }]}>Exportar a móvil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDatePicker = () => {
        if (!showDatePicker && !showTimePicker) return null;

        const isDate = showDatePicker;
        let value = new Date();
        
        if (isDate) {
            value = selectedDate || new Date();
        } else if (examTime) {
            const [hours, minutes] = examTime.split(':').map(Number);
            value.setHours(hours);
            value.setMinutes(minutes);
        }
        
        const handleChange = isDate ? onDateChange : onTimeChange;
        const mode = isDate ? 'date' : 'time';

        if (Platform.OS === 'android') {
            return (
                <DateTimePicker
                    value={value}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={handleChange}
                    minimumDate={isDate ? new Date() : undefined}
                    minuteInterval={isDate ? undefined : 15}
                />
            );
        }

        // iOS Implementation
        return (
            <Modal
                transparent={true}
                animationType="slide"
                visible={true} // Controlled by showDatePicker/showTimePicker check above
                onRequestClose={() => {
                    if (isDate) setShowDatePicker(false);
                    else setShowTimePicker(false);
                }}
            >
                <View style={styles.datePickerOverlay}>
                    <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (isDate) setShowDatePicker(false);
                                    else setShowTimePicker(false);
                                }}
                            >
                                <Text style={styles.datePickerDoneText}>Listo</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={value}
                            mode={mode}
                            is24Hour={true}
                            display="spinner"
                            onChange={handleChange}
                            minimumDate={isDate ? new Date() : undefined}
                            textColor="#3d2b1f" // Match theme
                            minuteInterval={isDate ? undefined : 15}
                        />
                    </View>
                </View>
            </Modal>
        );
    };

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

                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"} 
                        style={{ width: '100%' }}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
                    </KeyboardAvoidingView>
                </ParchmentCard>
                {renderDatePicker()}
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
        width: width * 0.95,
        maxHeight: height * 0.85,
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
    },
    weightContainer: {
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        borderRadius: 10,
        padding: 12,
        marginTop: 5,
    },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    weightItemLabel: {
        flex: 1,
        fontSize: 12,
        color: '#3d2b1f',
    },
    weightInput: {
        width: 60,
        paddingVertical: 5,
        paddingHorizontal: 8,
        textAlign: 'center',
        marginRight: 5,
    },
    weightTotalRow: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
        alignItems: 'flex-end',
    },
    weightTotalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    datePickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    datePickerContainer: {
        backgroundColor: '#f5e6d3', // Match parchment/modal bg somewhat
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    datePickerDoneText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8b4513',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#8b4513',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    checkboxActive: {
        backgroundColor: '#8b4513',
    },
});
