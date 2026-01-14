import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MuscleFatigue } from '@omega/logic';

const { width } = Dimensions.get('window');

interface MuscleHeatMapProps {
    fatigue: MuscleFatigue;
}

export const MuscleHeatMap: React.FC<MuscleHeatMapProps> = ({ fatigue }) => {
    // Standard color scale for fatigue
    const getFatigueColor = (score: number) => {
        if (score > 100000) return '#c0392b'; // High fatigue (deep red)
        if (score > 50000) return '#e67e22';  // Medium-high (orange)
        if (score > 10000) return '#f1c40f'; // Medium (yellow)
        return '#27ae60'; // Low fatigue (green)
    };

    const getNormalizedFatigue = (score: number) => {
        // Simple normalization based on a perceived "max" for 30 days
        const max = 200000; 
        return Math.min((score / max) * 100, 100);
    };

    const sortedMuscles = Object.entries(fatigue)
        .sort(([, a], [, b]) => b - a);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>VISOR DE FATIGA MUSCULAR</Text>
            {sortedMuscles.length === 0 ? (
                <Text style={styles.emptyText}>No hay datos de combate recientes.</Text>
            ) : (
                sortedMuscles.map(([muscle, score]) => (
                    <View key={muscle} style={styles.muscleRow}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.muscleName}>{muscle}</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View 
                                style={[
                                    styles.fatigueBar, 
                                    { 
                                        width: `${getNormalizedFatigue(score)}%`,
                                        backgroundColor: getFatigueColor(score)
                                    }
                                ]} 
                            />
                        </View>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8b4513',
        marginBottom: 15,
        textAlign: 'center',
        letterSpacing: 1,
    },
    muscleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    labelContainer: {
        width: 100,
    },
    muscleName: {
        fontSize: 12,
        color: '#3d2b1f',
        fontWeight: 'bold',
    },
    barContainer: {
        flex: 1,
        height: 12,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    fatigueBar: {
        height: '100%',
        borderRadius: 6,
    },
    emptyText: {
        textAlign: 'center',
        color: '#3d2b1f',
        opacity: 0.5,
        fontStyle: 'italic',
        fontSize: 12,
        marginTop: 10,
    }
});
