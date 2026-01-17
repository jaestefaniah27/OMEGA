export interface ICalendarService {
  requestPermissions(): Promise<boolean>;
  getPermissions(): Promise<boolean>;
  getCalendars(): Promise<any[]>;
  syncEvents(userId: string, importCalendarId: string): Promise<void>;
  exportEvent(title: string, date: Date, notes?: string, exportCalendarId?: string): Promise<string | null>;
}

export interface IHapticsService {
  vibrate(): void;
}

export interface IKeepAwakeService {
  activate(): void;
  deactivate(): void;
}

export interface INotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleNotification(title: string, body: string, seconds?: number, identifier?: string): Promise<string | null>;
  cancelNotification(identifier: string): Promise<void>;
  dismissNotification(identifier: string): Promise<void>;
}

export interface IPlatformService {
  calendar: ICalendarService;
  haptics: IHapticsService;
  keepAwake: IKeepAwakeService;
  notifications: INotificationService;
  os: string;
}
