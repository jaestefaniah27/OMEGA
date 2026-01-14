import React, { useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GameHUD } from '@omega/ui';
import { GameProvider } from './src/context/GameContext';
import { StatusBar } from 'expo-status-bar';
import { DeviceEventEmitter, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useGame } from './src/context/GameContext';
import { useWorkout } from './src/hooks/useWorkout';

import { RootStackParamList } from './src/navigation/AppNavigator';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>('Home');

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          setCurrentRoute(navigationRef.getCurrentRoute()?.name);
        }}
      >
        <GameProvider>
          <AppNavigator />
          <StatusBar style="light" />
          <AppContent currentRoute={currentRoute} />
        </GameProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

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

  const handleZurronPress = () => {
    DeviceEventEmitter.emit('GLOBAL_QUICK_ADD');
  };

  const { workout } = useGame();
  const EPIC_QUOTES = ["FORJANDO LEYENDA", "ACERO Y SANGRE", "VOLUNTAD DE HIERRO", "CAMINO AL VALHALLA", "LATIDO GUERRERO", "FORJANDO AL TITÁN", "NÉMESIS DEL LÍMITE", "SUDOR Y GLORIA"];
  const [quote] = React.useState(() => EPIC_QUOTES[Math.floor(Math.random() * EPIC_QUOTES.length)]);

  const handleWorkoutPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Barracks' as any);
    }
  };

  return (
    <>
      {workout.isSessionActive && currentRoute !== 'Barracks' && (
        <TouchableOpacity style={styles.workoutHeader} onPress={handleWorkoutPress} activeOpacity={0.9}>
          <View style={styles.timerContainer}>
            <Timer size={14} color="#FFD700" />
            <Text style={styles.timerText}>{workout.formatTime}</Text>
          </View>
          <Text style={styles.epicQuote}>{quote}</Text>
        </TouchableOpacity>
      )}
      <GameHUD
        onProfilePress={handleProfilePress}
        onMapPress={handleMapPress}
        onZurronPress={handleZurronPress}
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
  }
});
