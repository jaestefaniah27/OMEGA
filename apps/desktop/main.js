require('dotenv').config();
const { app, Tray, Menu } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const path = require('path');

// CONFIGURACIÓN
const CHECK_INTERVAL = 5000;
const UPLOAD_INTERVAL = 60000;

let supabase;
let tray = null;
let activityBuffer = {};

// --- 1. CONEXIÓN ---
try {
    console.log("🔵 Iniciando...");
    const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const userId = process.env.USER_ID;

    if (!url || !key || !userId) {
        console.error("🔴 Faltan credenciales en .env");
    } else {
        supabase = createClient(url, key);
        console.log("🟢 Supabase listo.");
    }
} catch (e) {
    console.error("🔴 Error config:", e);
}

// --- 2. HERRAMIENTAS DE VISIÓN (CORREGIDAS) ---

async function getActiveAppInfo() {
    try {
        // CAMBIO CRÍTICO: Importamos TODO el módulo, no solo 'default'
        const imported = await import('active-win');

        // Buscamos la función donde sea que esté
        let activeWinFunc = imported.activeWindow;

        // Si no está directa, probamos en default (por si acaso cambia en el futuro)
        if (!activeWinFunc && imported.default) {
            activeWinFunc = imported.default.activeWindow || imported.default;
        }

        if (typeof activeWinFunc !== 'function') {
            console.error("🔴 Error: activeWindow no encontrada en:", Object.keys(imported));
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
        console.error("🔴 ERROR CRÍTICO ACTIVE-WIN:", err);
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

// --- 3. BUCLE PRINCIPAL ---

async function checkActivity() {
    try {
        const focused = await getActiveAppInfo();
        const allOpen = await getAllOpenAppsInfo();

        if (!focused) {
            console.log("⚠️ Sin foco (Escritorio/Bloqueado)");
            return;
        }

        console.log(`FOCUS: "${focused.name}" (PID: ${focused.pid})`);

        // FONDO: Todas las que tengan PID diferente al foco
        let bgCount = 0;
        allOpen.forEach(app => {
            if (app.pid !== focused.pid) {
                addBuffer(app.name, 'background');
                console.log(`Fondo: ${app.name}`);
                bgCount++;
            }
        });

        // FOCO
        addBuffer(focused.name, 'focus');

        if (tray) {
            try { tray.setToolTip(`Omega: ${focused.name}`); } catch (e) { }
        }

    } catch (error) {
        console.error("🔴 ERROR BUCLE:", error);
    }
}

function addBuffer(appName, state) {
    if (!activityBuffer[appName]) activityBuffer[appName] = { focus: 0, background: 0 };
    activityBuffer[appName][state] += (CHECK_INTERVAL / 1000);
}

async function uploadActivities() {
    const appNames = Object.keys(activityBuffer);
    if (appNames.length === 0) return;

    console.log(`📤 Subiendo datos de ${appNames.length} apps...`);
    const updates = [];
    const userId = process.env.USER_ID;

    appNames.forEach(name => {
        const data = activityBuffer[name];
        if (data.focus > 0) updates.push({ user_id: userId, app_name: name, duration_seconds: data.focus, state: 'focus' });
        if (data.background > 0) updates.push({ user_id: userId, app_name: name, duration_seconds: data.background, state: 'background' });
    });

    const { error } = await supabase.from('computer_activities').insert(updates);
    if (error) console.error("🔴 Error Supabase:", error.message);
    else {
        console.log("✅ Guardado OK.");
        activityBuffer = {};
    }
}

app.whenReady().then(() => {
    console.log("🦇 OMEGA VIGILANTE ACTIVO");
    try { tray = new Tray(path.join(__dirname, 'icon.png')); } catch (e) { }
    setInterval(checkActivity, CHECK_INTERVAL);
    setInterval(uploadActivities, UPLOAD_INTERVAL);
});

app.on('window-all-closed', e => e.preventDefault());