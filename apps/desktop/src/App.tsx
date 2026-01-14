import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';
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
import { DesktopPlatformProvider } from './services/DesktopPlatformProvider';
import { DeviceEventEmitter } from 'react-native';
import { Castle, Calendar } from 'lucide-react-native';

console.log("Renderer: App.tsx evaluated");

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef<ParamListBase>();

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
    console.log("App Mounted - Restored Full Logic");
    setMounted(true);
  }, []);

  if (!mounted) return null;

  try {
    return (
    <SafeAreaProvider>
      <DesktopPlatformProvider>
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
      </DesktopPlatformProvider>
    </SafeAreaProvider>
  );
  } catch (e) {
    console.error("Render Error:", e);
    return <div style={{color: 'red', padding: 20}}>
        <h1>Critical Render Error</h1>
        <pre>{JSON.stringify(e, null, 2)}</pre>
    </div>;
  }
}
