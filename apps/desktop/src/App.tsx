import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
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
    MarketScreen,
    ProfileScreen,
    WarTableScreen,
    GameHUD 
} from '@omega/ui';
import { GameProvider, ToastProvider } from '@omega/logic';
import { DeviceEventEmitter } from 'react-native';
import { Castle, Calendar } from 'lucide-react-native';

// Simple style reset for web
import './App.css';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

function AppContent({ currentRoute }: { currentRoute: string | undefined }) {
  const handleProfilePress = () => {
    if (navigationRef.isReady()) {
      if (currentRoute === 'Profile') {
        navigationRef.goBack();
      } else {
        navigationRef.navigate('Profile' as any);
      }
    }
  };

  const handleMapPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Home' as any);
    }
  };

  const handleCastlePress = () => {
    if (navigationRef.isReady()) {
      if (currentRoute === 'Castle') {
        navigationRef.navigate('WarTable' as any);
      } else {
        navigationRef.navigate('Castle' as any);
      }
    }
  };

  const handleTheatrePress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Theatre' as any);
    }
  };

  const handleZurronPress = () => {
    DeviceEventEmitter.emit('GLOBAL_QUICK_ADD');
  };

  return (
      <GameHUD
        onProfilePress={handleProfilePress}
        onMapPress={handleMapPress}
        onZurronPress={handleZurronPress}
        onCastlePress={handleCastlePress}
        onTheatrePress={handleTheatrePress}
        castleIcon={currentRoute === 'Castle' ? Calendar : Castle}
      />
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>('Home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("App Mounted");
    setMounted(true);
  }, []);

  if (!mounted) return null;

  try {
    return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
            setCurrentRoute(navigationRef.getCurrentRoute()?.name);
            console.log("Route changed to:", navigationRef.getCurrentRoute()?.name);
        }}
      >
        <ToastProvider>
            <GameProvider>
                <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
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
                <AppContent currentRoute={currentRoute} />
            </GameProvider>
        </ToastProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
  } catch (e) {
    console.error("Render Error:", e);
    return <div style={{color: 'red'}}>Error: {JSON.stringify(e)}</div>;
  }
}
