import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import { Sword, Dumbbell, Trophy, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const BarracksScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>⚔️ LOS BARRACONES</Text>

                    {/* Sección La Forja: Rutina */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Dumbbell size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>LA FORJA</Text>
                        </View>
                        <Text style={styles.subTitle}>Rutina de Hoy: Push Day</Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>• Press Banca: 4 x 10</Text>
                            <Text style={styles.listItem}>• Press Militar: 3 x 12</Text>
                            <Text style={styles.listItem}>• Extensiones Tríceps: 3 x 15</Text>
                        </View>
                    </ParchmentCard>

                    {/* Sección El Coliseo: Records */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Trophy size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL COLISEO</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <Text style={styles.statLabel}>Deadlift:</Text>
                            <Text style={styles.statValue}>140kg</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <Text style={styles.statLabel}>Sentadilla:</Text>
                            <Text style={styles.statValue}>120kg</Text>
                        </View>
                    </ParchmentCard>

                    {/* Sección Espejo Mágico: Heatmap */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Activity size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>ESPEJO MÁGICO</Text>
                        </View>
                        <View style={styles.heatmapPlaceholder}>
                            <Text style={styles.heatmapText}>Heatmap Corporal</Text>
                            <Text style={styles.heatmapSubText}>(Próximamente: Gráfico SVG)</Text>
                        </View>
                    </ParchmentCard>

                    <MedievalButton
                        title="VOLVER AL MAPA"
                        onPress={() => navigation.goBack()}
                        variant="danger"
                        style={styles.backButton}
                    />

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
        backgroundColor: '#2c3e50', // Steel/Blue-grey placeholder
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
        marginBottom: 10,
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
    subTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    list: {
        paddingLeft: 10,
    },
    listItem: {
        fontSize: 14,
        color: '#3d2b1f',
        marginBottom: 5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#3d2b1f',
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 14,
        color: '#8b4513',
        fontWeight: 'bold',
    },
    heatmapPlaceholder: {
        height: 150,
        backgroundColor: 'rgba(61, 43, 31, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#3d2b1f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heatmapText: {
        fontSize: 18,
        color: '#3d2b1f',
        fontWeight: 'bold',
        opacity: 0.5,
    },
    heatmapSubText: {
        fontSize: 12,
        color: '#3d2b1f',
        opacity: 0.4,
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
