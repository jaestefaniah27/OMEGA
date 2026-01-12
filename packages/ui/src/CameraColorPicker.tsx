import React, { useState, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { X, Camera, Check } from 'lucide-react-native';
import { MedievalButton } from './MedievalButton';
import { toByteArray } from 'base64-js';
import jpeg from 'jpeg-js';

const { width, height } = Dimensions.get('window');

interface CameraColorPickerProps {
    visible: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
}

export const CameraColorPicker: React.FC<CameraColorPickerProps> = ({ visible, onClose, onColorSelect }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewColor, setPreviewColor] = useState<string | null>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Necesitamos permiso para usar la cámara y capturar colores místicos.</Text>
                    <MedievalButton title="CONCEDER PERMISO" onPress={requestPermission} />
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#8b4513', fontWeight: 'bold' }}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    const captureColor = async () => {
        if (!cameraRef.current || isCapturing) return;

        try {
            setIsCapturing(true);

            // 1. Take a picture (small quality)
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.2,
                base64: true,
            });

            if (!photo || !photo.base64) throw new Error("No se pudo capturar la imagen base64");

            // 2. Decode JPEG purely in JS
            const rawData = toByteArray(photo.base64);
            const jpegData = jpeg.decode(rawData, { useTArray: true });

            // 3. Get center pixel color
            const centerX = Math.floor(jpegData.width / 2);
            const centerY = Math.floor(jpegData.height / 2);
            const offset = (jpegData.width * centerY + centerX) * 4;

            const r = jpegData.data[offset];
            const g = jpegData.data[offset + 1];
            const b = jpegData.data[offset + 2];

            const toHex = (c: number) => c.toString(16).padStart(2, '0');
            const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

            setPreviewColor(hex);

        } catch (error) {
            console.error(error);
            Alert.alert("Error Místico", "No se pudo discernir el color en este plano.");
        } finally {
            setIsCapturing(false);
        }
    };

    const confirmColor = () => {
        if (previewColor) {
            onColorSelect(previewColor);
            setPreviewColor(null);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={false}>
            <View style={styles.container}>
                {!previewColor ? (
                    <View style={styles.cameraContainer}>
                        <CameraView style={styles.camera} ref={cameraRef} />
                        <View style={styles.overlay}>
                            <View style={styles.crosshair} />
                            <Text style={styles.hint}>Apunta el centro al color que deseas</Text>
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <X color="#fff" size={30} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.captureBtn, isCapturing && styles.disabledBtn]}
                                onPress={captureColor}
                                disabled={isCapturing}
                            >
                                {isCapturing ? <ActivityIndicator color="#fff" /> : <Camera color="#fff" size={32} />}
                            </TouchableOpacity>

                            <View style={{ width: 40 }} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewTitle}>COLOR DISCERNIDO</Text>
                        <View style={[styles.previewCircle, { backgroundColor: previewColor }]} />
                        <Text style={styles.previewHex}>{previewColor}</Text>

                        <View style={styles.previewBtns}>
                            <TouchableOpacity style={styles.discardBtn} onPress={() => setPreviewColor(null)}>
                                <X color="#fff" size={30} />
                                <Text style={styles.btnLabel}>DESCARTAR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmColor}>
                                <Check color="#fff" size={30} />
                                <Text style={styles.btnLabel}>USAR COLOR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraContainer: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    crosshair: {
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: '#FFD700',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    hint: {
        position: 'absolute',
        bottom: 150,
        color: '#FFD700',
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
        width: '100%',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#8b4513',
        borderWidth: 4,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    closeBtn: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F5E6C6',
    },
    permissionText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#3d2b1f',
        marginBottom: 30,
        fontWeight: 'bold',
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    previewTitle: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        letterSpacing: 2,
    },
    previewCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 5,
        borderColor: '#FFD700',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    previewHex: {
        color: '#F5E6C6',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1,
    },
    previewBtns: {
        flexDirection: 'row',
        marginTop: 50,
        width: '100%',
        justifyContent: 'space-around',
    },
    discardBtn: {
        alignItems: 'center',
        opacity: 0.8,
    },
    confirmBtn: {
        alignItems: 'center',
    },
    btnLabel: {
        color: '#F5E6C6',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
    }
});
