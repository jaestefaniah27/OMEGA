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
import { Zap, Sparkles, Code, Cpu } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const WizardTowerScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>🧙‍♂️ TORRE DE HECHICERÍA</Text>

                    {/* Lista de Proyectos: Grimorio de Proyectos */}
                    <ParchmentCard style={styles.projectCard}>
                        <View style={styles.cardHeader}>
                            <Sparkles size={20} color="#3d2b1f" />
                            <Text style={styles.cardTitle}>GRIMORIO DE PROYECTOS</Text>
                        </View>

                        {/* Proyecto 1 */}
                        <View style={styles.projectItem}>
                            <View style={styles.projectInfo}>
                                <Code size={16} color="#4834d4" />
                                <Text style={styles.projectName}>Proyecto Omega</Text>
                                <Text style={styles.projectPercent}>20%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '20%' }]} />
                            </View>
                        </View>

                        {/* Proyecto 2 */}
                        <View style={styles.projectItem}>
                            <View style={styles.projectInfo}>
                                <Cpu size={16} color="#4834d4" />
                                <Text style={styles.projectName}>Aprender React Native</Text>
                                <Text style={styles.projectPercent}>50%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '50%' }]} />
                            </View>
                        </View>
                    </ParchmentCard>

                    {/* Botón de Acción: Canalizar Maná */}
                    <MedievalButton
                        title="⚡ CANALIZAR MANÁ"
                        onPress={() => console.log('Channel Mana')}
                        style={styles.manaButton}
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
        backgroundColor: '#1e0d3d', // Dark purple/mystic placeholder
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
    projectCard: {
        width: width * 0.9,
        marginBottom: 30,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    projectItem: {
        marginBottom: 15,
    },
    projectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    projectName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#3d2b1f',
        marginLeft: 10,
    },
    projectPercent: {
        fontSize: 12,
        color: '#3d2b1f',
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(61, 43, 31, 0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#9c27b0', // Mystic purple progress
    },
    manaButton: {
        width: width * 0.9,
        marginBottom: 20,
    },
    backButton: {
        width: width * 0.9,
        marginTop: 10,
    }
});
