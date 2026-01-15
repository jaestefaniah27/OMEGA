require('dotenv').config();
const { app, Tray, Menu } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const path = require('path'); // Para normalizar rutas

// CONFIGURACIÓN
const CHECK_INTERVAL = 5000;
const UPLOAD_INTERVAL = 60000;
// Lista negra de procesos de sistema que hacen ruido
const IGNORED_PROCESSES = [
    'ApplicationFrameHost', 'SystemSettings', 'TextInputHost',
    'SearchHost', 'StartMenuExperienceHost', 'explorer'
];

let supabase;
let tray = null;
let activityBuffer = {};

// --- CONEXIÓN A LA TORRE (SUPABASE) ---
try {
    const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const userId = process.env.USER_ID;

    if (!url || !key || !userId) throw new Error("Faltan credenciales");

    supabase = createClient(url, key);
    console.log("✅ Familiar V2: Sistema de identificación por ruta activo.");
} catch (e) {
    console.error("❌ Error de credenciales:", e.message);
}

// --- OJOS DEL FAMILIAR ---

// 1. Ojo de Precisión (Devuelve objeto con nombre y ruta)
async function getActiveAppInfo() {
    try {
        const { default: activeWin } = await import('active-win');
        const activeWinFunc = activeWin.activeWindow || activeWin.default || activeWin;

        if (typeof activeWinFunc !== 'function') return null;

        const win = await activeWinFunc();
        if (win && win.owner) {
            return {
                name: win.owner.name, // "Google Chrome"
                path: win.owner.path  // "C:\Program Files\...\chrome.exe"
            };
        }
        return null;
    } catch { return null; }
}

// 2. Ojo de Área (Devuelve lista de objetos con nombre y ruta)
function getAllOpenAppsInfo() {
    return new Promise((resolve) => {
        // Pedimos ProcessName, MainWindowTitle y Path
        const cmd = `powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object ProcessName, Path | ConvertTo-Json -Compress"`;

        exec(cmd, (err, stdout) => {
            if (err) { resolve([]); return; }
            try {
                const data = JSON.parse(stdout);
                const list = Array.isArray(data) ? data : [data];

                // Filtramos basura y formateamos
                const apps = list
                    .filter(item =>
                        item.Path &&
                        item.ProcessName &&
                        !IGNORED_PROCESSES.includes(item.ProcessName)
                    )
                    .map(item => ({
                        name: item.ProcessName, // "chrome"
                        path: item.Path         // "C:\Program Files\...\chrome.exe"
                    }));

                resolve(apps);
            } catch { resolve([]); }
        });
    });
}

// --- CEREBRO DEL FAMILIAR ---

async function checkActivity() {
    try {
        const focused = await getActiveAppInfo();
        const allOpen = await getAllOpenAppsInfo();

        // Normalizamos la ruta del foco para comparar (minúsculas)
        const focusedPath = focused ? focused.path.toLowerCase() : '';

        // 1. Registrar FOCO
        if (focused) {
            trackTime(focused.name, 'focus');
            if (tray) tray.setToolTip(`Foco: ${focused.name}`);
            console.log(`🎯 FOCUS: ${focused.name}`);
        }

        // 2. Registrar FONDO (Evitando duplicados)
        const backgroundApps = new Set(); // Usamos Set para no repetir si hay 5 ventanas de Chrome

        allOpen.forEach(app => {
            const appPath = app.path.toLowerCase();

            // LA CLAVE: Comparamos rutas, no nombres
            if (appPath !== focusedPath) {
                backgroundApps.add(app.name);
            }
        });

        // Guardamos tiempo para las únicas en background
        backgroundApps.forEach(appName => {
            trackTime(appName, 'background');
            // console.log(`   💤 Background: ${appName}`); // Descomenta si quieres ver todo
        });

    } catch (error) {
        console.error("Error vigilando:", error);
    }
}

function trackTime(appName, state) {
    if (!activityBuffer[appName]) {
        activityBuffer[appName] = { focus: 0, background: 0 };
    }
    activityBuffer[appName][state] += (CHECK_INTERVAL / 1000);
}

async function uploadActivities() {
    const appNames = Object.keys(activityBuffer);
    if (appNames.length === 0) return;

    const updates = [];
    const userId = process.env.USER_ID;

    appNames.forEach(name => {
        const data = activityBuffer[name];
        if (data.focus > 0) {
            updates.push({ user_id: userId, app_name: name, duration_seconds: data.focus, state: 'focus' });
        }
        if (data.background > 0) {
            updates.push({ user_id: userId, app_name: name, duration_seconds: data.background, state: 'background' });
        }
    });

    if (updates.length > 0) {
        console.log(`📤 Subiendo reporte (${updates.length} apps)...`);
        const { error } = await supabase.from('computer_activities').insert(updates);

        if (error) console.error("❌ Error Supabase:", error.message);
        else {
            console.log("✅ Guardado correctamente.");
            activityBuffer = {};
        }
    }
}

app.whenReady().then(() => {
    if (app.dock) app.dock.hide();

    // Icono (Opcional)
    try {
        tray = new Tray(path.join(__dirname, 'icon.png'));
        tray.setToolTip('Omega Vigilante V2');
        tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Salir', click: () => app.quit() }]));
    } catch (e) { }

    setInterval(checkActivity, CHECK_INTERVAL);
    setInterval(uploadActivities, UPLOAD_INTERVAL);

    console.log("🦇 Familiar V2 iniciado.");
});

app.on('window-all-closed', e => e.preventDefault());