import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';

export const TavernScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: '#e67e22' }]}>
            <ParchmentCard>
                <Text style={styles.title}>🍳 TABERNA</Text>
                <Text style={styles.description}>Nutrición y Pociones. Lo que comes define tu energía.</Text>
            </ParchmentCard>

            <MedievalButton
                title="VOLVER AL MAPA"
                onPress={() => navigation.goBack()}
                variant="danger"
                style={styles.backButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
    backButton: {
        marginTop: 30,
    }
});
