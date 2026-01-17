import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { usePlatform } from '../services/PlatformContext';

const CALENDAR_STORAGE_KEY = 'omega_calendar_settings';

export const useCalendar = (userId: string | undefined) => {
    const platform = usePlatform();
    const [calendars, setCalendars] = useState<any[]>([]);
    const [importCalendarId, setImportCalendarId] = useState<string | null>(null);
    const [exportCalendarId, setExportCalendarId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        loadSettings();
        checkPermission();
    }, []);

    const checkPermission = useCallback(async () => {
        const granted = await platform.calendar.getPermissions();
        setPermissionGranted(granted);
        if (granted) {
            loadCalendars();
        }
    }, [platform.calendar]);

    const loadSettings = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                setImportCalendarId(settings.importId);
                setExportCalendarId(settings.exportId);
            }
        } catch (e) {
            console.error("Failed to load calendar settings", e);
        }
    }, []);

    const saveSettings = useCallback(async (importId: string | null, exportId: string | null) => {
        try {
            await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify({ importId, exportId }));
            setImportCalendarId(importId);
            setExportCalendarId(exportId);
        } catch (e) {
            console.error("Failed to save calendar settings", e);
        }
    }, []);

    const loadCalendars = useCallback(async () => {
        const granted = await platform.calendar.requestPermissions();
        setPermissionGranted(granted);
        if (granted) {
            const cals = await platform.calendar.getCalendars();
            setCalendars(cals);
        }
    }, [platform.calendar]);

    const syncNativeEventsToDecrees = useCallback(async () => {
        if (!importCalendarId || !userId) return;
        setIsSyncing(true);
        try {
            await platform.calendar.syncEvents(userId, importCalendarId);
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    }, [importCalendarId, userId, platform.calendar]);

    const exportDecreeToCalendar = useCallback(async (title: string, date: Date | null, notes?: string) => {
        if (!exportCalendarId || !date) return;
        try {
            return await platform.calendar.exportEvent(title, date, notes, exportCalendarId);
        } catch (e) {
            console.error("Export failed", e);
            return null;
        }
    }, [exportCalendarId, platform.calendar]);

    return useMemo(() => ({
        calendars,
        status: { status: permissionGranted ? 'granted' : 'denied' },
        requestPermission: loadCalendars,
        importCalendarId,
        exportCalendarId,
        isSyncing,
        saveSettings,
        syncNativeEventsToDecrees,
        exportDecreeToCalendar,
        registerBackgroundFetch: async () => { console.log("Background fetch not implemented for this platform yet"); },
    }), [
        calendars, permissionGranted, loadCalendars,
        importCalendarId, exportCalendarId, isSyncing,
        saveSettings, syncNativeEventsToDecrees, exportDecreeToCalendar
    ]);
};
