import React from 'react';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import {
  PlatformProvider as BasePlatformProvider,
  IPlatformService,
  ICalendarService,
  IHapticsService,
  IKeepAwakeService,
  INotificationService,
  supabase
} from '@omega/logic';

// --- LOGIC MOVED FROM HOOKS TO ADAPTER ---

const MobileCalendarService: ICalendarService = {
  requestPermissions: async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  },
  getPermissions: async () => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  },
  getCalendars: async () => {
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return cals.filter(c => c.allowsModifications);
  },
  syncEvents: async (userId: string, importCalendarId: string) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const events = await Calendar.getEventsAsync([importCalendarId], startDate, endDate);

    const { data: existingDecrees } = await supabase
      .from('royal_decrees')
      .select('calendar_event_id')
      .eq('user_id', userId)
      .not('calendar_event_id', 'is', null);

    const existingIds = new Set(existingDecrees?.map(d => d.calendar_event_id) || []);
    const newDecrees = [];

    for (const event of events) {
      if (existingIds.has(event.id)) continue;

      let type: any = 'GENERAL';
      const titleLower = event.title.toLowerCase();

      if (titleLower.includes('examen') || titleLower.includes('test') || titleLower.includes('parcial')) {
        type = 'EXAM';
      } else if (titleLower.includes('entreno') || titleLower.includes('gym') || titleLower.includes('workout')) {
        type = 'BARRACKS';
      }

      newDecrees.push({
        user_id: userId,
        title: event.title,
        description: event.notes,
        type: type,
        status: 'PENDING',
        due_date: event.startDate,
        calendar_event_id: event.id,
        target_quantity: 1,
        current_quantity: 0,
        unit: 'SESSIONS'
      });
    }

    if (newDecrees.length > 0) {
      await supabase.from('royal_decrees').insert(newDecrees);
    }
  },
  exportEvent: async (title, date, notes, exportCalendarId) => {
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);

    return await Calendar.createEventAsync(exportCalendarId!, {
      title,
      startDate: date,
      endDate: endDate,
      notes,
      timeZone: 'GMT',
    });
  },
};

const MobileHapticsService: IHapticsService = {
  vibrate: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
};

const MobileKeepAwakeService: IKeepAwakeService = {
  activate: () => KeepAwake.activateKeepAwakeAsync(),
  deactivate: () => KeepAwake.deactivateKeepAwake(),
};

const MobileNotificationService: INotificationService = {
  requestPermissions: async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },
  scheduleNotification: async (title, body, seconds = 0, identifier) => {
    return await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
    });
  },
  cancelNotification: async (identifier) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },
  dismissNotification: async (identifier) => {
    await Notifications.dismissNotificationAsync(identifier);
  },
};

const mobilePlatformService: IPlatformService = {
  calendar: MobileCalendarService,
  haptics: MobileHapticsService,
  keepAwake: MobileKeepAwakeService,
  notifications: MobileNotificationService,
  os: Platform.OS,
};

export const MobilePlatformProvider: React.FC<{ children: any }> = ({ children }) => {
  return (
    <BasePlatformProvider service={mobilePlatformService}>
      {children}
    </BasePlatformProvider>
  );
};
