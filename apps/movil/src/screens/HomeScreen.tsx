import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MedievalButton } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Home: undefined;
    Castle: undefined;
    Library: undefined;
    WizardTower: undefined;
    Barracks: undefined;
    Tavern: undefined;
    Temple: undefined;
    Theatre: undefined;
    Market: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🗺️ MAPA DEL MUNDO</Text>

            <View style={styles.buttonGrid}>
                <MedievalButton
                    title="🏰 Ir al Castillo"
                    onPress={() => navigation.navigate('Castle')}
                    style={styles.button}
                />
                <MedievalButton
                    title="📚 Ir a la Biblioteca"
                    onPress={() => navigation.navigate('Library')}
                    style={styles.button}
                />
                <MedievalButton
                    title="🧙‍♂️ Torre del Mago"
                    onPress={() => navigation.navigate('WizardTower')}
                    style={styles.button}
                />
                <MedievalButton
                    title="⚔️ Ir a los Barracones"
                    onPress={() => navigation.navigate('Barracks')}
                    style={styles.button}
                />
                <MedievalButton
                    title="🍳 Ir a la Taberna"
                    onPress={() => navigation.navigate('Tavern')}
                    style={styles.button}
                />
                <MedievalButton
                    title="⛪ Ir al Templo"
                    onPress={() => navigation.navigate('Temple')}
                    style={styles.button}
                />
                <MedievalButton
                    title="🎭 Ir al Teatro"
                    onPress={() => navigation.navigate('Theatre')}
                    style={styles.button}
                />
                <MedievalButton
                    title="🛒 Ir al Mercado"
                    onPress={() => navigation.navigate('Market')}
                    style={styles.button}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginVertical: 30,
        textAlign: 'center',
    },
    buttonGrid: {
        width: '100%',
        gap: 15,
    },
    button: {
        width: '100%',
    }
});
