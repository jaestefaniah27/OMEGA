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

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#3d2b1f',
                },
                headerTintColor: '#FFD700',
                headerTitleStyle: {
                    fontWeight: '700',
                    color: '#FFD700',
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Omega - Reino' }}
            />
            <Stack.Screen name="Castle" component={CastleScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="WizardTower" component={WizardTowerScreen} />
            <Stack.Screen name="Barracks" component={BarracksScreen} />
            <Stack.Screen name="Tavern" component={TavernScreen} />
            <Stack.Screen name="Temple" component={TempleScreen} />
            <Stack.Screen name="Theatre" component={TheatreScreen} />
            <Stack.Screen name="Market" component={MarketScreen} />
        </Stack.Navigator>
    );
};
