import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';

export const TheatreScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: '#8e44ad' }]}>
            <ParchmentCard>
                <Text style={styles.title}>🎭 TEATRO</Text>
                <Text style={styles.description}>Ocio y Entretenimiento. No todo es batalla.</Text>
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
