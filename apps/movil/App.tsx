import React, { useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GameHUD } from '@omega/ui';
import { GameProvider, useGame, ToastProvider, WorkoutTimerProvider, useWorkoutTimer } from '@omega/logic';
import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Timer, Castle, Calendar } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from './src/navigation/AppNavigator';
import { MobilePlatformProvider } from './src/services/MobilePlatformProvider';
import { useDesktopSpy } from './src/hooks/useDesktopSpy';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>('Home');

  // 👁️ Activamos el espía
  const { activeApp, windowTitle } = useDesktopSpy();

  // 🧪 Performance: Long Task Detector
  React.useEffect(() => {
    let lastTime = performance.now();
    const check = () => {
      const now = performance.now();
      const diff = now - lastTime;
      if (diff > 100) { // If a frame takes > 100ms, the UI is freezing
        console.warn(`[Performance] 💀 UNRESPONSIVE THREAD: ${diff.toFixed(0)} ms!`);
      }
      lastTime = now;
      requestAnimationFrame(check);
    };
    const frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    // IMPORTANTE: Todo debe estar dentro de este GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MobilePlatformProvider>
          <NavigationContainer
            ref={navigationRef}
            onStateChange={() => {
              setCurrentRoute(navigationRef.getCurrentRoute()?.name);
            }}
          >
            <ToastProvider>
              <GameProvider>
                <WorkoutTimerProvider>
                  <AppNavigator />
                  <StatusBar style="light" />
                  <AppContent currentRoute={currentRoute} />
                </WorkoutTimerProvider>
              </GameProvider>
            </ToastProvider>
          </NavigationContainer>
        </MobilePlatformProvider>
      </SafeAreaProvider>

      {/* 👁️ VISUALIZACIÓN DEL ESPÍA (Absoluta, flotando encima) */}
      {activeApp && (
        <View style={styles.spyContainer}>
          <Text style={styles.spyText}>👁️ {activeApp}</Text>
          <Text style={styles.spySubtext} numberOfLines={1}>{windowTitle}</Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

// --- Componentes Auxiliares ---

const WorkoutHeader: React.FC<{ onWorkoutPress: () => void; currentRoute: string | undefined }> = ({ onWorkoutPress, currentRoute }) => {
  const { workout } = useGame();
  const { formatTime } = useWorkoutTimer();
  const EPIC_QUOTES = ["FORJANDO LEYENDA", "ACERO Y SANGRE", "VOLUNTAD DE HIERRO", "CAMINO AL VALHALLA", "LATIDO GUERRERO", "FORJANDO AL TITÁN", "NÉMESIS DEL LÍMITE", "SUDOR Y GLORIA"];
  const [quote] = React.useState(() => EPIC_QUOTES[Math.floor(Math.random() * EPIC_QUOTES.length)]);

  if (!workout.isSessionActive || currentRoute === 'Barracks') return null;

  return (
    <TouchableOpacity style={styles.workoutHeader} onPress={onWorkoutPress} activeOpacity={0.9}>
      <View style={styles.timerContainer}>
        <Timer size={14} color="#FFD700" />
        <Text style={styles.timerText}>{formatTime}</Text>
      </View>
      <Text style={styles.epicQuote}>{quote}</Text>
    </TouchableOpacity>
  );
};

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

  const handleSettingsPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Settings' as any);
    }
  };

  const handleQuickAddPress = () => {
    DeviceEventEmitter.emit('GLOBAL_QUICK_ADD');
  };

  const handleWorkoutPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Barracks' as any);
    }
  };

  if (currentRoute === 'ZenFireplace') return null;

  return (
    <>
      <WorkoutHeader
        onWorkoutPress={handleWorkoutPress}
        currentRoute={currentRoute}
      />
      <GameHUD
        onProfilePress={handleProfilePress}
        onMapPress={handleMapPress}
        onQuickAddPress={handleQuickAddPress}
        onCastlePress={handleCastlePress}
        onSettingsPress={handleSettingsPress}
        castleIcon={currentRoute === 'Castle' ? Calendar : Castle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  workoutHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(26, 15, 10, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    zIndex: 9999,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  epicQuote: {
    color: 'rgba(255, 215, 0, 0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // ESTILOS DEL ESPÍA
  spyContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#330000', // Rojo oscuro sangre
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
    zIndex: 10000, // Por encima de todo
    maxWidth: 200,
  },
  spyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  spySubtext: {
    color: '#ffcccc',
    fontSize: 10,
  }
});