const { contextBridge, ipcRenderer } = require('electron');

// Exponemos una API segura llamada "electronAPI"
contextBridge.exposeInMainWorld('electronAPI', {
    // Función para pedir la ventana activa
    getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
});