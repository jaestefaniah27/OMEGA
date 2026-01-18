import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    HomeScreen
} from '@omega/ui/src/screens/HomeScreen';
import { CastleScreen } from '@omega/ui/src/screens/CastleScreen';
import { LibraryScreen } from '@omega/ui/src/screens/LibraryScreen';
import { WizardTowerScreen } from '@omega/ui/src/screens/WizardTowerScreen';
import { BarracksScreen } from '@omega/ui/src/screens/BarracksScreen';
import { TavernScreen } from '@omega/ui/src/screens/TavernScreen';
import { TempleScreen } from '@omega/ui/src/screens/TempleScreen';
import { TheatreScreen } from '@omega/ui/src/screens/TheatreScreen';
import { SettingsScreen } from '@omega/ui/src/screens/SettingsScreen';
import { MarketScreen } from '@omega/ui/src/screens/MarketScreen';
import { ProfileScreen } from '@omega/ui/src/screens/ProfileScreen';
import { WarTableScreen } from '@omega/ui/src/screens/WarTableScreen';
import { ZenFireplaceScreen } from '@omega/ui/src/screens/ZenFireplaceScreen';

export type RootStackParamList = {
    Home: undefined;
    Castle: undefined;
    Library: undefined;
    WizardTower: undefined;
    Barracks: undefined;
    Tavern: undefined;
    Temple: undefined;
    Theatre: undefined;
    Settings: undefined;
    Market: undefined;
    Profile: undefined;
    WarTable: undefined;
    ZenFireplace: undefined;
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
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Market" component={MarketScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="WarTable" component={WarTableScreen} />
            <Stack.Screen name="ZenFireplace" component={ZenFireplaceScreen} />
        </Stack.Navigator>
    );
};
