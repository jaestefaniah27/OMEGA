import React from 'react';
import type { 
  IPlatformService,
  ICalendarService,
  IHapticsService,
  IKeepAwakeService,
  INotificationService 
} from '@omega/logic';
import { PlatformProvider as BasePlatformProvider } from '@omega/logic';

const DesktopCalendarService: ICalendarService = {
  requestPermissions: async () => {
    console.log('Desktop: Calendar permissions requested');
    return true; 
  },
  getCalendars: async () => {
    console.log('Desktop: Loading mock calendars');
    return [{ id: 'mock-1', title: 'Calendario Local', allowsModifications: true }];
  },
  syncEvents: async (userId: string, importCalendarId: string) => {
    console.log(`Desktop: Syncing events for user ${userId} from calendar ${importCalendarId}`);
  },
  exportEvent: async (title, _date, _notes, exportCalendarId) => {
    console.log(`Desktop: Exporting event "${title}" to calendar ${exportCalendarId}`);
    return 'desktop-event-id';
  },
};

const DesktopHapticsService: IHapticsService = {
  vibrate: () => {
    console.log('Desktop: (Vibrate) Bzzzt!');
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  },
};

const DesktopKeepAwakeService: IKeepAwakeService = {
  activate: () => {
    console.log('Desktop: Keep Awake Activated');
  },
  deactivate: () => {
    console.log('Desktop: Keep Awake Deactivated');
  },
};

const DesktopNotificationService: INotificationService = {
  requestPermissions: async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  },
  scheduleNotification: async (title, body, seconds = 0, identifier) => {
    console.log(`Desktop Notification scheduled: ${title} - ${body} (in ${seconds}s)`);
    if (seconds === 0 && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return identifier || Math.random().toString();
  },
  cancelNotification: async (identifier) => {
    console.log(`Desktop: Cancel notification ${identifier}`);
  },
  dismissNotification: async (identifier) => {
    console.log(`Desktop: Dismiss notification ${identifier}`);
  },
};

const desktopPlatformService: IPlatformService = {
  calendar: DesktopCalendarService,
  haptics: DesktopHapticsService,
  keepAwake: DesktopKeepAwakeService,
  notifications: DesktopNotificationService,
  os: 'web',
};

export const DesktopPlatformProvider: React.FC<{ children: any }> = ({ children }) => {
  return (
    <BasePlatformProvider service={desktopPlatformService}>
      {children}
    </BasePlatformProvider>
  );
};
