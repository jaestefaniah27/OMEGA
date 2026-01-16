import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Alert
} from 'react-native';
import { MedievalButton, ParchmentCard } from '..';
import { useTavern } from '@omega/logic';
import { Utensils, Droplet, Flame, Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TavernScreen: React.FC = () => {
    const { todayWater, recommendedWater, isGoalReached, registerWater } = useTavern();
    const [isDrinking, setIsDrinking] = useState(false);

    const handleAddWater = async () => {
        setIsDrinking(true);
        await registerWater(1);
        setIsDrinking(false);

        if (todayWater + 1 === recommendedWater) {
            Alert.alert(
                "¡HONOR A TU SALUD!",
                "Has cumplido con tu hidratación diaria. Tu cuerpo es tu templo y hoy lo has honrado como un verdadero guerrero.",
                [{ text: "Así sea" }]
            );
        }
    };

    const renderJars = () => {
        const jars = [];
        for (let i = 0; i < recommendedWater; i++) {
            jars.push(
                <Text key={i} style={[styles.jarIcon, i < todayWater ? styles.jarFull : styles.jarEmpty]}>
                    {i < todayWater ? '🍺' : '⚪'}
                </Text>
            );
        }
        return jars;
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>🍺 LA TABERNA DEL JABALÍ</Text>

                    {/* Sección La Barra: Hidratación */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Droplet size={20} color="#3498db" />
                            <Text style={styles.sectionTitle}>LA BARRA</Text>
                        </View>

                        <View style={styles.hydrationInfo}>
                            <Text style={styles.expertQuote}>
                                "Un guerrero sabio sabe que la fuerza no solo viene del acero, sino de la pureza de su sangre. Bebe al menos {recommendedWater} jarras diarias."
                            </Text>
                        </View>

                        <View style={styles.waterTracker}>
                            <Text style={styles.waterLabel}>Jarras de Agua:</Text>
                            <Text style={styles.waterValue}>{todayWater} / {recommendedWater}</Text>
                        </View>

                        <View style={styles.jarContainer}>
                            <View style={styles.jarGrid}>
                                {renderJars()}
                            </View>
                        </View>

                        {isGoalReached && (
                            <View style={styles.goalReachedBadge}>
                                <Trophy size={16} color="#FFD700" />
                                <Text style={styles.goalReachedText}>¡OBJETIVO CUMPLIDO!</Text>
                            </View>
                        )}

                        <MedievalButton
                            title={isDrinking ? "Bebiendo..." : "¡Beber una Jarra!"}
                            onPress={handleAddWater}
                            variant="primary"
                            disabled={isDrinking}
                            style={styles.drinkButton}
                        />
                    </ParchmentCard>

                    {/* Sección El Despensero: Macros (Placeholder) */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Utensils size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL DESPENSERO</Text>
                        </View>
                        <Text style={styles.placeholderText}>
                            Próximamente: Seguimiento de alimentos y raciones para mantener tu energía vital.
                        </Text>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <Flame size={16} color="#e67e22" />
                                <Text style={styles.macroLabel}>--- Cal</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#e74c3c' }]} />
                                <Text style={styles.macroLabel}>Prot: --g</Text>
                            </View>
                        </View>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#f1c40f' }]} />
                                <Text style={styles.macroLabel}>Grv: --g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
                                <Text style={styles.macroLabel}>Carb: --g</Text>
                            </View>
                        </View>
                    </ParchmentCard>


                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundPlaceholder: {
        flex: 1,
        backgroundColor: '#3d2b1f',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 40,
        marginBottom: 30,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    sectionCard: {
        width: width * 0.9,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    hydrationInfo: {
        marginBottom: 15,
        backgroundColor: 'rgba(52, 152, 219, 0.05)',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#3498db',
    },
    expertQuote: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#5d4037',
        lineHeight: 20,
    },
    waterTracker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    waterLabel: {
        fontSize: 16,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    waterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
    },
    jarContainer: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    jarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    jarIcon: {
        fontSize: 28,
    },
    jarFull: {
        opacity: 1,
    },
    jarEmpty: {
        opacity: 0.3,
    },
    goalReachedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        padding: 8,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2ecc71',
    },
    goalReachedText: {
        color: '#27ae60',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 5,
    },
    drinkButton: {
        marginTop: 10,
    },
    placeholderText: {
        fontSize: 12,
        color: '#7f8c8d',
        fontStyle: 'italic',
        marginBottom: 15,
        textAlign: 'center',
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
        opacity: 0.5,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 100,
    },
    macroLabel: {
        fontSize: 14,
        color: '#3d2b1f',
        marginLeft: 8,
        fontWeight: '600',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    }
});
