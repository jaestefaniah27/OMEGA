import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GameHUD } from '@omega/ui';
import { StatusBar } from 'expo-status-bar';

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
        <AppNavigator />
        <StatusBar style="light" />
        <AppContent currentRoute={currentRoute} />
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

  return (
    <GameHUD onProfilePress={handleProfilePress} />
  );
}
