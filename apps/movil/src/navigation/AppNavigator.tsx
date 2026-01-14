import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CastleScreen } from '../screens/CastleScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { WizardTowerScreen } from '../screens/WizardTowerScreen';
import { BarracksScreen } from '../screens/BarracksScreen';
import { TavernScreen } from '../screens/TavernScreen';
import { TempleScreen } from '../screens/TempleScreen';
import { TheatreScreen } from '../screens/TheatreScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WarTableScreen } from '../screens/WarTableScreen';

export type RootStackParamList = {
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 200, // Faster transition
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Castle" component={CastleScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="WizardTower" component={WizardTowerScreen} />
            <Stack.Screen name="Barracks" component={BarracksScreen} />
            <Stack.Screen name="Tavern" component={TavernScreen} />
            <Stack.Screen name="Temple" component={TempleScreen} />
            <Stack.Screen name="Theatre" component={TheatreScreen} />
            <Stack.Screen name="Market" component={MarketScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="WarTable" component={WarTableScreen} />
        </Stack.Navigator>
    );
};
