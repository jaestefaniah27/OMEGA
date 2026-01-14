import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

// Global helper for non-component files
export const showGlobalToast = (message: string, type: ToastType = 'success') => {
    DeviceEventEmitter.emit('GLOBAL_TOAST', { message, type });
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    React.useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_TOAST', ({ message, type }) => {
            showToast(message, type);
        });
        return () => sub.remove();
    }, [showToast]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={styles.container}>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast, onRemove: () => void }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-100)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle2 size={20} color="#27ae60" />;
            case 'error': return <AlertCircle size={20} color="#e74c3c" />;
            case 'info': return <Info size={20} color="#3498db" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'success': return '#27ae60';
            case 'error': return '#e74c3c';
            case 'info': return '#d4af37';
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    borderLeftColor: getBorderColor(),
                }
            ]}
        >
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={styles.message}>{toast.message}</Text>
            <TouchableOpacity onPress={onRemove} style={styles.closeBtn}>
                <X size={16} color="#8b4513" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'box-none',
    },
    toast: {
        width: width * 0.9,
        backgroundColor: '#f4ece1', // Pergamino
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderLeftWidth: 6,
        // Sombra medieval
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: '#3d2b1f',
        fontWeight: '600',
    },
    closeBtn: {
        marginLeft: 10,
        padding: 4,
    }
});
