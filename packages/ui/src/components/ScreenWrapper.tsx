import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { PerformanceLogger } from '@omega/logic';

interface ScreenWrapperProps {
    children: React.ReactNode;
    background?: string;
}

/**
 * ScreenWrapper
 * 
 * Este componente ayuda a gestionar la memoria desvelando/ocultando el contenido
 * de la pantalla según si tiene el foco de la navegación o no.
 * Al perder el foco, el contenido se desmonta, liberando RAM y deteniendo re-renders innecesarios.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, background = '#000' }) => {
    const isFocused = useIsFocused();
    const [mountTime] = React.useState(Date.now());

    React.useEffect(() => {
        if (isFocused) {
            const now = Date.now();
            const lastInteraction = PerformanceLogger.getLastInteraction();

            // Si hubo una interacción reciente (últimos 10 segundos), medimos desde ahí.
            // Si no, medimos desde que se montó el wrapper.
            const startTime = (lastInteraction > 0 && (now - lastInteraction) < 10000)
                ? lastInteraction
                : mountTime;

            const latency = now - startTime;
            const screenName = (children as any)?.type?.name || 'Unknown Screen';

            const prefix = (lastInteraction > 0 && (now - lastInteraction) < 10000)
                ? '👆 [INTERACCIÓN]'
                : '🟢 [MONTAJE]';

            console.log(`${prefix} Pantalla "${screenName}" lista en ${latency}ms`);
        } else {
            // OPTIMIZATION: Hint to GC when screen loses focus
            const screenName = (children as any)?.type?.name || 'Unknown Screen';
            console.log(`🧹 [CLEANUP] Desmontando "${screenName}"`);
        }
    }, [isFocused]);

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {isFocused ? children : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
