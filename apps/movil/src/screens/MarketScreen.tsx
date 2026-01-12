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
import { Coins, ShoppingBag, FlaskConical, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const MarketScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>⚖️ MERCADO NEGRO</Text>

                    {/* Saldo de Oro */}
                    <ParchmentCard style={styles.balanceCard}>
                        <View style={styles.balanceHeader}>
                            <Coins size={30} color="#d4af37" />
                            <Text style={styles.balanceTitle}>SALDO REAL</Text>
                        </View>
                        <Text style={styles.balanceAmount}>120 Oro</Text>
                    </ParchmentCard>

                    {/* SECCIÓN Tienda del Alquimista: Items */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <FlaskConical size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>TIENDA DEL ALQUIMISTA</Text>
                        </View>

                        <View style={styles.shopItem}>
                            <View style={styles.itemInfo}>
                                <Package size={18} color="#3d2b1f" />
                                <Text style={styles.itemName}>Pedir Pizza (Cena Épica)</Text>
                            </View>
                            <MedievalButton
                                title="500 Oro"
                                onPress={() => console.log('Buy Pizza')}
                                style={styles.buyButton}
                            />
                        </View>

                        <View style={styles.shopItem}>
                            <View style={styles.itemInfo}>
                                <Package size={18} color="#3d2b1f" />
                                <Text style={styles.itemName}>Videojuego Nuevo</Text>
                            </View>
                            <MedievalButton
                                title="5k Oro"
                                onPress={() => console.log('Buy Game')}
                                style={styles.buyButton}
                            />
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
        backgroundColor: '#1a1a1a', // Black market / Dark placeholder
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
    balanceCard: {
        width: width * 0.9,
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#d4af37',
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    balanceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#d4af37',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
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
    shopItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 14,
        color: '#3d2b1f',
        marginLeft: 10,
        fontWeight: '600',
    },
    buyButton: {
        minWidth: 80,
        height: 40,
    },
    backButton: {
        marginTop: 20,
        width: '100%',
    }
});
