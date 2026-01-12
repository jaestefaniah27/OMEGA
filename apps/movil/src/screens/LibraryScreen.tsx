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
import { BookOpen, Timer, BookText } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const LibraryScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>🏛️ LA GRAN BIBLIOTECA</Text>

                    {/* Elemento Central: Sección Prohibida */}
                    <ParchmentCard style={styles.mainCard}>
                        <View style={styles.cardHeader}>
                            <BookText size={20} color="#3d2b1f" />
                            <Text style={styles.cardTitle}>LA SECCIÓN PROHIBIDA</Text>
                        </View>

                        <View style={styles.timerContainer}>
                            <Timer size={40} color="#3d2b1f" strokeWidth={1.5} />
                            <Text style={styles.timerText}>00:00</Text>
                        </View>

                        <MedievalButton
                            title="INICIAR SESIÓN DE ESTUDIO"
                            onPress={() => console.log('Start Study')}
                            style={styles.studyButton}
                        />
                    </ParchmentCard>

                    {/* Elemento Secundario:Grimorio de Talentos */}
                    <MedievalButton
                        title="📖 ABRIR GRIMORIO DE TALENTOS"
                        onPress={() => console.log('Skill Tree')}
                        style={styles.talentButton}
                    />

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
        backgroundColor: '#3d2b1f', // Ancient brown/wood placeholder
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
    mainCard: {
        width: width * 0.9,
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 30,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    timerText: {
        fontSize: 60,
        fontWeight: '300',
        color: '#3d2b1f',
        marginLeft: 15,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    studyButton: {
        width: '100%',
    },
    talentButton: {
        width: width * 0.9,
        marginBottom: 20,
    },
    backButton: {
        width: width * 0.9,
        marginTop: 10,
    }
});
