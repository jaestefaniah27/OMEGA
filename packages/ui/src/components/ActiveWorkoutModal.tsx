import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MedievalButton, ParchmentCard } from '..';
import { Timer, X, Plus, Save, Trash2, History, ChevronRight } from 'lucide-react-native';
import { useActiveWorkout, useExercises, Exercise, useWorkoutTimer } from '@omega/logic';

const { width, height } = Dimensions.get('window');

interface ActiveWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({ visible, onClose }) => {
    const {
        isSessionActive,
        currentSets,
        addSet,
        finishSession,
        isResting,
        setIsResting
    } = useActiveWorkout();
    const { elapsedSeconds, formatTime } = useWorkoutTimer();

    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { exercises } = useExercises(searchQuery);

    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);


    const handleAddSet = () => {
        if (!selectedExercise || !weight || !reps) return;
        addSet(selectedExercise.id, parseFloat(weight), parseInt(reps));
        setReps(''); // Clear reps for next set, keep weight as likely same
    };

    const handleFinish = async () => {
        await finishSession('Entrenamiento completado en la Forja.');
        onClose();
    };

    // Group sets by exercise for display
    const groupedSets = currentSets.reduce((acc, set) => {
        if (!acc[set.exerciseId]) acc[set.exerciseId] = [];
        acc[set.exerciseId].push(set);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <View style={styles.timerContainer}>
                        <Timer size={20} color="#FFD700" />
                        <Text style={styles.timerText}>{formatTime}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                    <Text style={styles.title}>BITÁCORA DE COMBATE</Text>

                    {Object.keys(groupedSets).length === 0 ? (
                        <View style={styles.emptyState}>
                            <History size={48} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>La forja está fría... añade una técnica para empezar.</Text>
                        </View>
                    ) : (
                        Object.entries(groupedSets).map(([exId, sets]) => (
                            <ParchmentCard key={exId} style={styles.exerciseCard}>
                                <Text style={styles.exerciseTitle}>
                                    {exercises.find(e => e.id === exId)?.name_es || 'Ejercicio'}
                                </Text>
                                <View style={styles.setsList}>
                                    {sets.map((set, i) => (
                                        <View key={i} style={styles.setRow}>
                                            <Text style={styles.setNumber}>Serie {i + 1}</Text>
                                            <Text style={styles.setData}>{set.weight} kg x {set.reps}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ParchmentCard>
                        ))
                    )}

                    {!selectedExercise && (
                        <MedievalButton
                            title="Añadir Técnica"
                            onPress={() => setShowExercisePicker(true)}
                            variant="primary"
                            style={{ marginTop: 20 }}
                        />
                    )}

                    {selectedExercise && (
                        <ParchmentCard style={styles.entryCard}>
                            <View style={styles.entryHeader}>
                                <Text style={styles.entryTitle}>{selectedExercise.name_es}</Text>
                                <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                                    <X size={18} color="#3d2b1f" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>PESO (KG)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        placeholder="0"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>REPS</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={reps}
                                        onChangeText={setReps}
                                        keyboardType="numeric"
                                        placeholder="0"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddSet}
                                >
                                    <Plus size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </ParchmentCard>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <MedievalButton
                        title="FINALIZAR MISIÓN"
                        onPress={handleFinish}
                        style={{ width: '100%' }}
                    />
                </View>

                {/* Exercise Picker Modal */}
                <Modal visible={showExercisePicker} animationType="fade" transparent={true}>
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TextInput
                                    style={styles.pickerSearch}
                                    placeholder="Buscar ejercicio..."
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                                    <X size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.pickerList}>
                                {exercises.map(ex => (
                                    <TouchableOpacity
                                        key={ex.id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setSelectedExercise(ex);
                                            setShowExercisePicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerItemText}>{ex.name_es}</Text>
                                        <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#000',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    timerText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 2,
    },
    exerciseCard: {
        marginBottom: 15,
        padding: 15,
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
        paddingBottom: 5,
    },
    setsList: {
        marginTop: 5,
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    setNumber: {
        color: '#8b4513',
        fontWeight: '600',
    },
    setData: {
        color: '#3d2b1f',
        fontWeight: 'bold',
    },
    entryCard: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fdf5e6',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    entryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8b4513',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginRight: 10,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 5,
    },
    input: {
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.3)',
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#3d2b1f',
    },
    addButton: {
        width: 45,
        height: 40,
        backgroundColor: '#8b4513',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 20,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,215,0,0.2)',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        opacity: 0.5,
    },
    emptyText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        maxWidth: '80%',
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        width: width * 0.9,
        height: height * 0.7,
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFD700',
        overflow: 'hidden',
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#000',
    },
    pickerSearch: {
        flex: 1,
        height: 45,
        color: '#fff',
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    pickerList: {
        flex: 1,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    pickerItemText: {
        color: '#fff',
        fontSize: 16,
    },
});
