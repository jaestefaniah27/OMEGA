require('dotenv').config();
const { app, Tray, Menu, BrowserWindow, shell } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const path = require('path');

// CONFIGURACIÓN
const CHECK_INTERVAL = 5000;
const UPLOAD_INTERVAL = 3600000; // 1 Hora (Agregación local)
const WEB_URL = 'http://localhost:8081';
const DEBUG = true;

let supabase;
let tray = null;
let mainWindow = null;
let forceQuit = false;
let activityBuffer = {};

// AURA SYSTEM STATE
let mappings = [];
let pendingAuraByTheme = {}; // { theme_id: number }

// DETECTION STATE
let knownApps = new Set();
let startTime = Date.now();

// --- TOOLS ---

async function getActiveAppInfo() {
    try {
        const imported = await import('active-win');
        let activeWinFunc = imported.activeWindow || imported.default?.activeWindow || imported.default;
        if (typeof activeWinFunc !== 'function') return null;
        const win = await activeWinFunc();
        if (win && win.owner) {
            return { name: win.owner.name, pid: win.owner.processId };
        }
        return null;
    } catch (err) {
        return null;
    }
}

function getAllOpenAppsInfo() {
    return new Promise((resolve) => {
        const cmd = `powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object ProcessName, Id | ConvertTo-Json -Compress"`;
        exec(cmd, (err, stdout) => {
            if (err) { resolve([]); return; }
            try {
                const data = JSON.parse(stdout);
                const list = Array.isArray(data) ? data : [data];
                resolve(list.map(item => ({ name: item.ProcessName, pid: item.Id })));
            } catch { resolve([]); }
        });
    });
}

// --- HELPERS ---

async function loadKnownApps() {
    if (!supabase || !process.env.USER_ID) return;
    try {
        const { data } = await supabase.rpc('get_detected_apps', { target_user_id: process.env.USER_ID });
        if (data) data.forEach(d => knownApps.add(d.process_name));
    } catch (e) { }
}

async function loadMappings() {
    if (!supabase || !process.env.USER_ID) return;
    try {
        const { data } = await supabase.rpc('get_app_mappings', { target_user_id: process.env.USER_ID });
        if (data) mappings = data;
    } catch (e) { }
}

async function uploadNewApp(appName) {
    if (!process.env.USER_ID) return;
    try {
        const payload = [{ user_id: process.env.USER_ID, process_name: appName, last_seen: new Date().toISOString() }];
        await supabase.rpc('upsert_detected_apps', { payload });
        knownApps.add(appName);
    } catch (e) { }
}

// --- LOOPS ---

async function checkActivity() {
    try {
        const focused = await getActiveAppInfo();
        const allOpen = await getAllOpenAppsInfo();
        if (!focused) return;

        if (focused.name && !knownApps.has(focused.name)) await uploadNewApp(focused.name);
        for (const app of allOpen) {
            if (app.name && !knownApps.has(app.name)) await uploadNewApp(app.name);
        }

        if (!activityBuffer[focused.name]) activityBuffer[focused.name] = { focus: 0, background: 0 };
        activityBuffer[focused.name].focus += (CHECK_INTERVAL / 1000);

        allOpen.forEach(app => {
            if (app.pid !== focused.pid) {
                if (!activityBuffer[app.name]) activityBuffer[app.name] = { focus: 0, background: 0 };
                activityBuffer[app.name].background += (CHECK_INTERVAL / 1000);
            }
        });

        if (mappings.length > 0) {
            const focusedNameLower = focused.name.toLowerCase();
            const focusMap = mappings.find(m => m.process_name.toLowerCase() === focusedNameLower);
            if (focusMap) {
                const points = 10 * (CHECK_INTERVAL / 1000);
                pendingAuraByTheme[focusMap.theme_id] = (pendingAuraByTheme[focusMap.theme_id] || 0) + points;
            }

            allOpen.forEach(app => {
                if (!app.name || app.name.toLowerCase() === focusedNameLower) return;
                const bgMap = mappings.find(m => m.process_name.toLowerCase() === app.name.toLowerCase());
                if (bgMap) {
                    const points = 1 * (CHECK_INTERVAL / 1000);
                    pendingAuraByTheme[bgMap.theme_id] = (pendingAuraByTheme[bgMap.theme_id] || 0) + points;
                }
            });
        }
        if (tray) { try { tray.setToolTip(`Omega: ${focused.name}`); } catch (e) { } }
    } catch (error) {
        console.error("Loop Error:", error);
    }
}

async function uploadActivities() {
    const userId = process.env.USER_ID;
    if (!userId) return;

    const currentHour = new Date().getHours();
    await loadMappings();

    const appNames = Object.keys(activityBuffer);
    if (appNames.length > 0) {
        console.log(`📤 Syncing hourly summary for ${appNames.length} apps...`);
        for (const name of appNames) {
            const data = activityBuffer[name];
            if (data.focus > 0 || data.background > 0) {
                try {
                    await supabase.rpc('upsert_activity_summary', {
                        p_user_id: userId,
                        p_app_name: name,
                        p_focus_secs: Math.floor(data.focus),
                        p_bg_secs: Math.floor(data.background),
                        p_hour: currentHour
                    });
                } catch (e) { console.error(`Error syncing ${name}:`, e); }
            }
        }
        activityBuffer = {};
    }

    const themeIds = Object.keys(pendingAuraByTheme);
    if (themeIds.length > 0) {
        for (const themeId of themeIds) {
            const amount = Math.floor(pendingAuraByTheme[themeId]);
            if (amount > 0) {
                try {
                    await supabase.rpc('increment_theme_aura', { p_theme_id: themeId, p_amount: amount });
                } catch (e) { }
            }
        }
        pendingAuraByTheme = {};
    }
}

function createMainWindow() {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); return; }
    mainWindow = new BrowserWindow({
        width: 1200, height: 800,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: { nodeIntegration: false, contextIsolation: true },
        autoHideMenuBar: true
    });
    mainWindow.loadURL(WEB_URL);
    mainWindow.on('close', (e) => { if (!forceQuit) { e.preventDefault(); mainWindow.hide(); } });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(async () => {
    try {
        const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        const userId = process.env.USER_ID;
        if (url && key && userId) {
            supabase = createClient(url, key);
            await loadMappings();
            await loadKnownApps();
        }
        tray = new Tray(path.join(__dirname, 'icon.png'));
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Abrir OMEGA', click: createMainWindow },
            { type: 'separator' },
            { label: 'Salir', click: () => { forceQuit = true; app.quit(); } }
        ]);
        tray.setToolTip('OMEGA Vigilante');
        tray.setContextMenu(contextMenu);
        tray.on('click', createMainWindow);
    } catch (e) { console.error("Init Error:", e); }

    setInterval(checkActivity, CHECK_INTERVAL);
    setInterval(uploadActivities, UPLOAD_INTERVAL);
});

app.on('window-all-closed', (e) => { e.preventDefault(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });