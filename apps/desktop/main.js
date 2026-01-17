require('dotenv').config();
const { app, Tray, Menu, BrowserWindow, shell } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const path = require('path');

// CONFIGURACIÓN
const CHECK_INTERVAL = 5000;
const UPLOAD_INTERVAL = 10000; // Debug 10s
const WEB_URL = 'http://localhost:8081'; // URL de Expo Web en desarrollo
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
let knownApps = new Set(); // Apps we have already seen this session (or fetched from DB)

// --- 1. CONEXIÓN ---
// La conexión se inicializa en app.whenReady()

// --- 2. HERRAMIENTAS DE VISIÓN ---

async function getActiveAppInfo() {
    try {
        const imported = await import('active-win');
        let activeWinFunc = imported.activeWindow;
        if (!activeWinFunc && imported.default) {
            activeWinFunc = imported.default.activeWindow || imported.default;
        }

        if (typeof activeWinFunc !== 'function') {
            return null;
        }

        const win = await activeWinFunc();
        if (win && win.owner) {
            return {
                name: win.owner.name,
                pid: win.owner.processId
            };
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
                const apps = list.map(item => ({ name: item.ProcessName, pid: item.Id }));
                resolve(apps);
            } catch { resolve([]); }
        });
    });
}

// --- 3. HELPER LOGIC ---

async function loadKnownApps() {
    if (!supabase || !process.env.USER_ID) return;
    try {
        // Use RPC to bypass RLS for reading
        const { data, error } = await supabase.rpc('get_detected_apps', { target_user_id: process.env.USER_ID });

        if (error) {
            console.error("Error loading known apps (RPC):", error.message);
            return;
        }

        if (data) {
            data.forEach(d => knownApps.add(d.process_name));
            console.log(`🧠 Memoria: ${knownApps.size} apps conocidas.`);
        }
    } catch (e) {
        console.error("Error loading known apps:", e);
    }
}

async function loadMappings() {
    if (!supabase || !process.env.USER_ID) return;
    try {
        const { data, error } = await supabase.rpc('get_app_mappings', { target_user_id: process.env.USER_ID });

        if (error) {
            console.error("Error loading mappings (RPC):", error.message);
            return;
        }

        if (data) {
            mappings = data;
            console.log(`📚 Mapeos de Aura actualizados: ${mappings.length} reglas.`);
        }
    } catch (e) {
        console.error("Error loading mappings:", e);
    }
}

function setupRealtime() {
    if (!supabase) return;
    console.log("📡 Conectando a Supabase Realtime...");

    supabase
        .channel('aura_mappings_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'app_aura_mappings' },
            (payload) => {
                console.log('🔄 Cambio detectado en mapeos, recargando...');
                loadMappings();
            }
        )
        .subscribe();
}

async function uploadNewApp(appName) {
    if (!process.env.USER_ID) return;

    try {
        const payload = [{
            user_id: process.env.USER_ID,
            process_name: appName,
            last_seen: new Date().toISOString()
        }];

        // Immediate upload via RPC
        const { error } = await supabase.rpc('upsert_detected_apps', { payload });

        if (error) {
            console.error(`❌ Error registrando app ${appName}:`, error.message);
        } else {
            console.log(`✅ Nueva app registrada: ${appName}`);
            knownApps.add(appName);
        }
    } catch (e) {
        console.error("Error in uploadNewApp:", e);
    }
}

// --- 4. MAIN LOOP ---

async function checkActivity() {
    try {
        const focused = await getActiveAppInfo();
        const allOpen = await getAllOpenAppsInfo();

        if (!focused) return;

        // A. IMMEDIATE DETECTION
        // Check focused app
        if (focused.name && !knownApps.has(focused.name)) {
            await uploadNewApp(focused.name);
        }

        // Check all open apps (batch check locally to avoid spam calls)
        for (const app of allOpen) {
            if (app.name && !knownApps.has(app.name)) {
                await uploadNewApp(app.name);
            }
        }

        // B. LEGACY BUFFER (Activity History)
        if (!activityBuffer[focused.name]) activityBuffer[focused.name] = { focus: 0, background: 0 };
        activityBuffer[focused.name].focus += (CHECK_INTERVAL / 1000);

        allOpen.forEach(app => {
            if (app.pid !== focused.pid) {
                if (!activityBuffer[app.name]) activityBuffer[app.name] = { focus: 0, background: 0 };
                activityBuffer[app.name].background += (CHECK_INTERVAL / 1000);
            }
        });

        // C. AURA SYSTEM CALCULATION (Case Insensitive)
        if (mappings.length > 0) {
            const focusedNameLower = focused.name.toLowerCase();

            // Focus Checks (10 pts/sec)
            const focusMap = mappings.find(m => m.process_name.toLowerCase() === focusedNameLower);

            if (focusMap) {
                const points = 10 * (CHECK_INTERVAL / 1000); // 50 pts
                pendingAuraByTheme[focusMap.theme_id] = (pendingAuraByTheme[focusMap.theme_id] || 0) + points;
                console.log(`✨ AURA FOCUS: +${points} pts para tema ${focusMap.theme_id.substr(0, 4)}... (App: ${focused.name})`);
            }

            // Background Checks (1 pt/sec)
            let bgCount = 0;
            // Debug available apps
            // if (DEBUG) console.log(`   🔎 Checking ${allOpen.length} apps for background match...`);

            allOpen.forEach(app => {
                // Ensure app.name exists
                if (!app.name) return;

                const appNameLower = app.name.toLowerCase();
                // Avoid double counting focused app as background
                if (appNameLower === focusedNameLower) return;

                const bgMap = mappings.find(m => m.process_name.toLowerCase() === appNameLower);
                if (bgMap) {
                    bgCount++;
                    const points = 1 * (CHECK_INTERVAL / 1000); // 5 pts
                    pendingAuraByTheme[bgMap.theme_id] = (pendingAuraByTheme[bgMap.theme_id] || 0) + points;
                    if (DEBUG) console.log(`   🌑 AURA BG: +${points} pts para tema ${bgMap.theme_id.substr(0, 4)}... (App: ${app.name})`);
                }
            });
            if (bgCount > 0) console.log(`   (Detectadas ${bgCount} apps en segundo plano con aura)`);
        }

        // D. Tray Update
        if (tray) {
            try { tray.setToolTip(`Omega: ${focused.name}`); } catch (e) { }
        }

    } catch (error) {
        console.error("🔴 ERROR BUCLE:", error);
    }
}

async function uploadActivities() {
    const userId = process.env.USER_ID;
    if (!userId) return;

    // 1. Upload Legacy Activities (History)
    const appNames = Object.keys(activityBuffer);
    if (appNames.length > 0) {
        console.log(`📤 Subiendo historial de ${appNames.length} apps...`);
        const updates = [];
        appNames.forEach(name => {
            const data = activityBuffer[name];
            if (data.focus > 0) updates.push({ user_id: userId, app_name: name, duration_seconds: data.focus, state: 'focus' });
            if (data.background > 0) updates.push({ user_id: userId, app_name: name, duration_seconds: data.background, state: 'background' });
        });

        if (updates.length > 0) {
            await supabase.from('computer_activities').insert(updates);
        }
        activityBuffer = {};
    }

    // 2. Flush Aura to Domains
    const themeIds = Object.keys(pendingAuraByTheme);
    if (themeIds.length > 0) {
        console.log("🌊 Volcando Aura acumulada a la Torre...");
        for (const themeId of themeIds) {
            const amount = Math.floor(pendingAuraByTheme[themeId]);
            if (amount > 0) {
                try {
                    console.log(`   > Actualizando Tema ${themeId.substr(0, 4)}... +${amount} pts`);

                    const { error } = await supabase.rpc('increment_theme_aura', {
                        p_theme_id: themeId,
                        p_amount: amount
                    });

                    if (error) {
                        console.error(`❌ Error updating aura for theme ${themeId}:`, error.message);
                    } else {
                        console.log("     ✅ Actualización exitosa.");
                    }
                } catch (e) {
                    console.error("Error updating theme aura:", e);
                }
            }
        }
        pendingAuraByTheme = {};
    } else {
        console.log("💤 Sin aura acumulada para volcar.");
    }
}

function createMainWindow() {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        return;
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true
    });

    mainWindow.loadURL(WEB_URL);

    mainWindow.on('close', (e) => {
        if (!forceQuit) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    // Abrir enlaces externos en el navegador por defecto
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(async () => {
    console.log("🦇 OMEGA VIGILANTE ACTIVO");
    try {
        console.log("🔵 Iniciando...");
        const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        const userId = process.env.USER_ID;

        if (!url || !key || !userId) {
            console.error("🔴 Faltan credenciales en .env");
        } else {
            supabase = createClient(url, key);
            console.log("🟢 Supabase conectado.");

            // Cargar datos ANTES de iniciar los intervalos
            await loadMappings();
            await loadKnownApps();
            setupRealtime();
        }

        tray = new Tray(path.join(__dirname, 'icon.png'));

        const contextMenu = Menu.buildFromTemplate([
            { label: 'Abrir OMEGA', click: createMainWindow },
            { type: 'separator' },
            { label: 'Salir', click: () => { forceQuit = true; app.quit(); } }
        ]);

        tray.setToolTip('OMEGA Vigilante');
        tray.setContextMenu(contextMenu);

        // Al hacer clic en el icono, abrimos la app
        tray.on('click', createMainWindow);

    } catch (e) {
        console.error("Error inicializando:", e);
    }

    setInterval(checkActivity, CHECK_INTERVAL);
    setInterval(uploadActivities, UPLOAD_INTERVAL);
});

app.on('window-all-closed', (e) => {
    // No salimos de la app cuando se cierran las ventanas, 
    // se queda en el tray.
    e.preventDefault();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});