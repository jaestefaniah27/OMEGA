import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Definimos la interfaz de lo que nos devuelve el espía
interface WindowInfo {
    title: string;
    owner: {
        name: string;
        bundleId?: string;
    };
}

export const useDesktopSpy = () => {
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [windowTitle, setWindowTitle] = useState<string | null>(null);

    useEffect(() => {
        // Solo activamos el espía si estamos en Web y existe el puente de Electron
        // @ts-ignore
        if (Platform.OS === 'web' && window.electronAPI) {
            console.log("🕵️ Espía de escritorio activado");

            const interval = setInterval(async () => {
                try {
                    // @ts-ignore
                    const info: WindowInfo = await window.electronAPI.getActiveWindow();

                    if (info && info.owner) {
                        // Actualizamos el estado con la app que el usuario está usando
                        setActiveApp(info.owner.name);
                        setWindowTitle(info.title);

                        // Aquí puedes poner logs para probar
                        // console.log("Viendo:", info.owner.name, "-", info.title);
                    }
                } catch (err) {
                    console.warn("Error espiando ventana:", err);
                }
            }, 2000); // Espiar cada 2 segundos

            return () => clearInterval(interval);
        }
    }, []);

    return { activeApp, windowTitle };
};