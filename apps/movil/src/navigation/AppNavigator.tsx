import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    HomeScreen,
    CastleScreen,
    LibraryScreen,
    WizardTowerScreen,
    BarracksScreen,
    TavernScreen,
    TempleScreen,
    TheatreScreen,
    SettingsScreen,
    MarketScreen,
    ProfileScreen,
    WarTableScreen,
    ZenFireplaceScreen
} from '@omega/ui';

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
