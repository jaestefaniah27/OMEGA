import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import { Trophy, Coins, Star, CheckSquare, Square } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CastleScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>🏰 SALA DEL TRONO</Text>

                    {/* Sección 1: Estado del Reino */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Trophy size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>ESTADO DEL REINO</Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Star size={18} color="#8b4513" />
                                <Text style={styles.statText}>Nivel 5</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Coins size={18} color="#d4af37" />
                                <Text style={styles.statText}>120 Oro</Text>
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>XP EXPERIENCIA</Text>
                                <Text style={styles.progressValue}>450 / 1000</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '45%' }]} />
                            </View>
                        </View>
                    </ParchmentCard>

                    {/* Sección 2: Decretos Reales */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>DECRETOS REALES</Text>
                        </View>

                        <View style={styles.missionItem}>
                            <CheckSquare size={20} color="#27ae60" />
                            <Text style={[styles.missionText, styles.completedMission]}>Pagar diezmos al Rey</Text>
                        </View>

                        <View style={styles.missionItem}>
                            <Square size={20} color="#3d2b1f" />
                            <Text style={styles.missionText}>Ir al dentista (Cita en Feudo)</Text>
                        </View>

                        <View style={styles.missionItem}>
                            <Square size={20} color="#3d2b1f" />
                            <Text style={styles.missionText}>Entrenar infantería (Gym)</Text>
                        </View>
                    </ParchmentCard>

                    {/* Botones de Acción */}
                    <View style={styles.actionSection}>
                        <MedievalButton
                            title="MESA DE GUERRA"
                            onPress={() => console.log('Calendario')}
                            style={styles.actionButton}
                        />
                        <MedievalButton
                            title="ARCHIVOS REALES"
                            onPress={() => console.log('Drive')}
                            style={styles.actionButton}
                        />
                    </View>

                    <MedievalButton
                        title="VOLVER AL MAPA"
                        onPress={() => navigation.goBack()}
                        variant="danger"
                        style={styles.backButton}
                    />

                    {/* Padding for HUD */}
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
        backgroundColor: '#2b2b2b', // Dark stone placeholder
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3d2b1f',
        marginLeft: 8,
    },
    progressContainer: {
        marginTop: 10,
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
        height: 12,
        backgroundColor: 'rgba(61, 43, 31, 0.2)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#d4af37', // Gold-ish progress
    },
    missionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    missionText: {
        fontSize: 16,
        color: '#3d2b1f',
        marginLeft: 12,
    },
    completedMission: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    actionSection: {
        width: '100%',
        marginTop: 10,
    },
    actionButton: {
        width: '100%',
        marginBottom: 15,
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
