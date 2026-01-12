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
import { Mask, Music, Ticket, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TheatreScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>🎭 GRAN TEATRO REAL</Text>

                    {/* Sección Camerinos: Hobbies */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Music size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>CAMERINOS</Text>
                        </View>
                        <View style={styles.hobbyRow}>
                            <Text style={styles.hobbyName}>Piano:</Text>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Nvl 3</Text>
                            </View>
                        </View>
                        <View style={styles.hobbyRow}>
                            <Text style={styles.hobbyName}>Pintura:</Text>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Nvl 1</Text>
                            </View>
                        </View>
                    </ParchmentCard>

                    {/* Sección Taquilla: Recompensas */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ticket size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>TAQUILLA</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardName}>Ver un episodio de Serie</Text>
                            <Text style={styles.rewardPrice}>100 Oro</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardName}>Sesión de Gaming (1h)</Text>
                            <Text style={styles.rewardPrice}>250 Oro</Text>
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
        backgroundColor: '#4a148c', // Deep purple theater-vibe placeholder
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
    hobbyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    hobbyName: {
        fontSize: 16,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    levelBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    rewardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
    },
    rewardName: {
        fontSize: 14,
        color: '#3d2b1f',
        flex: 1,
    },
    rewardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b8860b',
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
