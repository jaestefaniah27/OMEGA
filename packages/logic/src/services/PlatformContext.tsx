import React, { createContext, useContext, ReactNode } from 'react';
import { IPlatformService } from './PlatformInterfaces';

const noop = () => { };
const noopAsync = async () => { };

const defaultPlatform: IPlatformService = {
  calendar: {
    requestPermissions: async () => false,
    getPermissions: async () => false,
    getCalendars: async () => [],
    syncEvents: noopAsync,
    exportEvent: async () => null,
  },
  haptics: {
    vibrate: noop,
  },
  keepAwake: {
    activate: noop,
    deactivate: noop,
  },
  notifications: {
    requestPermissions: async () => false,
    scheduleNotification: async () => null,
    cancelNotification: noopAsync,
    dismissNotification: noopAsync,
  },
  os: 'unknown',
};

const PlatformContext = createContext<IPlatformService>(defaultPlatform);

export const PlatformProvider: React.FC<{ service: IPlatformService; children: ReactNode }> = ({ service, children }) => {
  return (
    <PlatformContext.Provider value={service}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => useContext(PlatformContext);
