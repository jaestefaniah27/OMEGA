import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Target, Dumbbell, Heart, User } from 'lucide-react-native';
import {
    TodayScreen, FocusScreen, GymScreen, HealthScreen, AccountScreen,
    AgendaScreen, LeisureScreen, RewardsScreen, AppSettingsScreen,
    colors, font,
} from '@omega/ui';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs: React.FC = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textFaint,
            tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: font.weight.medium },
            tabBarIcon: ({ color, size }) => {
                const s = size - 2;
                switch (route.name) {
                    case 'Hoy': return <Home size={s} color={color} />;
                    case 'Enfoque': return <Target size={s} color={color} />;
                    case 'Gimnasio': return <Dumbbell size={s} color={color} />;
                    case 'Salud': return <Heart size={s} color={color} />;
                    case 'Perfil': return <User size={s} color={color} />;
                    default: return null;
                }
            },
        })}
    >
        <Tab.Screen name="Hoy" component={TodayScreen} />
        <Tab.Screen name="Enfoque" component={FocusScreen} />
        <Tab.Screen name="Gimnasio" component={GymScreen} />
        <Tab.Screen name="Salud" component={HealthScreen} />
        <Tab.Screen name="Perfil" component={AccountScreen} />
    </Tab.Navigator>
);

export const AppNavigator: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Ocio" component={LeisureScreen} />
        <Stack.Screen name="Recompensas" component={RewardsScreen} />
        <Stack.Screen name="Ajustes" component={AppSettingsScreen} />
    </Stack.Navigator>
);
