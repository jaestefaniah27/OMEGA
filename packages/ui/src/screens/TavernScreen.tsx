import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { MedievalButton, ParchmentCard } from '..';
import { useNavigation } from '@react-navigation/native';
import { Coffee, Utensils, Droplet, Flame } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TavernScreen: React.FC = () => {
    const navigation = useNavigation();

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
                        <View style={styles.waterTracker}>
                            <Text style={styles.waterLabel}>Jarras de Agua:</Text>
                            <Text style={styles.waterValue}>4 / 8</Text>
                        </View>
                        <View style={styles.jarContainer}>
                            {/* Simplified jar representation */}
                            <Text style={styles.jarIcons}>🍺 🍺 🍺 🍺 ⚪ ⚪ ⚪ ⚪</Text>
                        </View>
                    </ParchmentCard>

                    {/* Sección El Despensero: Macros */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Utensils size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL DESPENSERO</Text>
                        </View>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <Flame size={16} color="#e67e22" />
                                <Text style={styles.macroLabel}>2100 Cal</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#e74c3c' }]} />
                                <Text style={styles.macroLabel}>Prot: 120g</Text>
                            </View>
                        </View>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#f1c40f' }]} />
                                <Text style={styles.macroLabel}>Grv: 70g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
                                <Text style={styles.macroLabel}>Carb: 250g</Text>
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
        backgroundColor: '#5d4037', // Tavern brown placeholder
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
    waterTracker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    waterLabel: {
        fontSize: 16,
        color: '#3d2b1f',
    },
    waterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
    },
    jarContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    jarIcons: {
        fontSize: 24,
        letterSpacing: 5,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
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
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
