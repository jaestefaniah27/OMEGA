import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Dimensions,
    useWindowDimensions
} from 'react-native';
import { MapLocationPin } from '../MapLocationPin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

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
    Profile: undefined;
    WarTable: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = React.memo(() => {
    const navigation = useNavigation<NavigationProp>();

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <View style={styles.container}>
            <View style={[
                styles.mapBase,
                isDesktop && {
                    maxWidth: 1024,
                    alignSelf: 'center',
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: '#333'
                }
            ]}>
                <Text style={styles.mapTitle}>REINO DE OMEGA</Text>

                {/* Castle: North-Center */}
                <MapLocationPin
                    title="Castillo"
                    icon="🏰"
                    top="24%"
                    left="50%"
                    onPress={() => navigation.navigate('Castle')}
                />

                {/* Library: North-East */}
                <MapLocationPin
                    title="Biblioteca"
                    icon="📚"
                    top="20%"
                    left="82%"
                    onPress={() => navigation.navigate('Library')}
                />

                {/* Wizard Tower: Mid-East */}
                <MapLocationPin
                    title="Torre del Mago"
                    icon="🧙‍♂️"
                    top="36%"
                    left="88%"
                    onPress={() => navigation.navigate('WizardTower')}
                />

                {/* Temple: Mid-West */}
                <MapLocationPin
                    title="Templo"
                    icon="⛪"
                    top="42%"
                    left="18%"
                    onPress={() => navigation.navigate('Temple')}
                />

                {/* Theatre: Center */}
                <MapLocationPin
                    title="Teatro"
                    icon="🎭"
                    top="48%"
                    left="60%"
                    onPress={() => navigation.navigate('Theatre')}
                />

                {/* Barracks: South-West */}
                <MapLocationPin
                    title="Barracones"
                    icon="⚔️"
                    top="65%"
                    left="20%"
                    onPress={() => navigation.navigate('Barracks')}
                />

                {/* Tavern: South-East (Near Market) */}
                <MapLocationPin
                    title="Taberna"
                    icon="🍳"
                    top="68%"
                    left="78%"
                    onPress={() => navigation.navigate('Tavern')}
                />

                <MapLocationPin
                    title="Mercado"
                    icon="🛒"
                    top="82%"
                    left="85%"
                    onPress={() => navigation.navigate('Market')}
                />


            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mapBase: {
        flex: 1,
        backgroundColor: '#1c1c1c', // Dark stone/ground color
        width: '100%',
        height: '100%',
    },
    mapTitle: {
        position: 'absolute',
        top: 50,
        width: '100%',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 4,
        opacity: 0.6,
    }
});
