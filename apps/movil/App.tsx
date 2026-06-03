import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { MobilePlatformProvider } from './src/services/MobilePlatformProvider';
import {
  GameProvider, ToastProvider, WorkoutProvider,
  queryClient, persistOptions, wireFocusManager, wireAuthSync, initOutbox,
} from '@omega/logic';
import { colors } from '@omega/ui';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

export default function App() {
  useEffect(() => {
    wireFocusManager();
    wireAuthSync();
    initOutbox();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <MobilePlatformProvider>
            <ToastProvider>
              <GameProvider>
                <WorkoutProvider>
                  <NavigationContainer theme={navTheme}>
                    <StatusBar style="light" />
                    <AppNavigator />
                  </NavigationContainer>
                </WorkoutProvider>
              </GameProvider>
            </ToastProvider>
          </MobilePlatformProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
