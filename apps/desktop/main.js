require('dotenv').config();
const { app, Tray, Menu } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 1. Configuración
const CHECK_INTERVAL = 5000; // Chequear ventana cada 5s
const UPLOAD_INTERVAL = 10000; // Subir a la BD cada 1min

let supabase;
let tray = null;
let activityBuffer = {}; // Aquí acumulamos el tiempo: { "VS Code": 120, "Chrome": 60 }

// Inicializar Supabase
try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log("✅ Conectado a Supabase");
} catch (e) {
    console.error("❌ Error Supabase:", e);
}

// --- LÓGICA DEL ESPÍA ---

async function checkActivity() {
    try {
        // Importación dinámica para active-win
        const { default: activeWin } = await import('active-win');
        const window = await activeWin();

        if (window && window.owner) {
            const appName = window.owner.name;

            // Sumamos el intervalo al buffer local
            if (!activityBuffer[appName]) {
                activityBuffer[appName] = 0;
            }
            activityBuffer[appName] += (CHECK_INTERVAL / 1000);

            console.log(`👀 Viendo: ${appName}`); // Descomentar para depurar
        }
    } catch (error) {
        // A veces falla si no hay ventana activa o permisos, ignoramos
    }
}

async function uploadActivities() {
    const apps = Object.keys(activityBuffer);
    if (apps.length === 0) return;

    console.log("📤 Subiendo reporte...", activityBuffer);

    const updates = apps.map(appName => ({
        app_name: appName,
        duration_seconds: activityBuffer[appName],
        // user_id: 'TU_UUID_FIJO_SI_QUIERES' // Opcional
    }));

    const { error } = await supabase
        .from('computer_activities')
        .insert(updates);

    if (error) console.error("❌ Fallo subida:", error);
    else {
        console.log("✅ Reporte guardado.");
        activityBuffer = {}; // Limpiamos el buffer
    }
}

// --- CICLO DE VIDA DE ELECTRON ---

app.whenReady().then(() => {
    // 1. Ocultar del Dock/Barra de tareas (comportamiento fantasma)
    if (app.dock) app.dock.hide();

    // 2. Crear icono en la bandeja del sistema (Tray)
    // Necesitas un icono pequeño 'icon.png' en la carpeta o fallará. 
    // Si no tienes, comenta las líneas del Tray temporalmente.

    tray = new Tray('icon.png');
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Familiar Omega: Vigilando...', enabled: false },
        { type: 'separator' },
        { label: 'Cerrar', click: () => app.quit() }
    ]);
    tray.setToolTip('Omega Tracker');
    tray.setContextMenu(contextMenu);


    // 3. Arrancar bucles
    setInterval(checkActivity, CHECK_INTERVAL);
    setInterval(uploadActivities, UPLOAD_INTERVAL);

    console.log("🦇 El Familiar ha despertado.");
});

// Evitar que la app se cierre si no hay ventanas (porque no tendremos ninguna)
app.on('window-all-closed', (e) => e.preventDefault());