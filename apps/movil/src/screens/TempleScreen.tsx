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
import { Heart, Moon, Sun, Scroll } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TempleScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>⛪ TEMPLO DE LOS ANCESTROS</Text>

                    {/* Sección El Altar: Gratitud */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Scroll size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL ALTAR</Text>
                        </View>
                        <Text style={styles.subTitle}>Gratitud Diaria:</Text>
                        <View style={styles.gratitudeList}>
                            <Text style={styles.gratitudeItem}>1. Por la buena salud del reino.</Text>
                            <Text style={styles.gratitudeItem}>2. Por los aliados de confianza.</Text>
                            <Text style={styles.gratitudeItem}>3. Por un nuevo amanecer.</Text>
                        </View>
                    </ParchmentCard>

                    {/* Sección La Cripta: Sueño */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Moon size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>LA CRIPTA</Text>
                        </View>
                        <View style={styles.sleepData}>
                            <Text style={styles.sleepTime}>7h 30m</Text>
                            <Text style={styles.sleepQuality}>Sueño Reparador</Text>
                        </View>
                        <View style={styles.sleepFooter}>
                            <Text style={styles.sleepSub}>Ayer: 6h 15m (Fatiga detectable)</Text>
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
        backgroundColor: '#34495e', // Temple blue/grey placeholder
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
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
    subTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 10,
    },
    gratitudeList: {
        paddingHorizontal: 10,
    },
    gratitudeItem: {
        fontSize: 14,
        color: '#5d4037',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    sleepData: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    sleepTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    sleepQuality: {
        fontSize: 16,
        color: '#27ae60',
        fontWeight: '600',
        marginTop: 5,
    },
    sleepFooter: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
        paddingTop: 8,
    },
    sleepSub: {
        fontSize: 12,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
