import React, { useState, useRef, useMemo } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform,
    ScrollView
} from 'react-native';
import { X, Sparkles } from 'lucide-react-native';
import { MedievalButton } from './MedievalButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ManualColorPickerProps {
    visible: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
}

// Separate component using the EXACT logic from StarRatingSlider
const ColorSlider = ({ value, max, onChange, label, colors, onScrollToggle }: {
    value: number,
    max: number,
    onChange: (val: number) => void,
    label: string,
    colors: string[],
    onScrollToggle: (enabled: boolean) => void
}) => {
    const [sliderWidth, setSliderWidth] = useState(0);
    const sliderRef = useRef<View>(null);

    const updateValue = (evt: any) => {
        // Using nativeEvent.locationX exactly like StarRatingSlider
        const x = evt.nativeEvent.locationX;
        if (sliderWidth > 0) {
            let newVal = (x / sliderWidth) * max;
            // Clamping
            if (newVal < 0) newVal = 0;
            if (newVal > max) newVal = max;
            onChange(newVal);
        }
    };

    return (
        <View style={styles.sliderWrapper}>
            <View style={styles.labelRow}>
                <Text style={styles.sliderLabel}>{label}</Text>
                <Text style={styles.valueLabel}>{Math.round(value)}</Text>
            </View>
            <View
                ref={sliderRef}
                style={styles.sliderTrackContainer}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                // EXACT Responder logic from TheatreScreen's StarRatingSlider
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(evt) => {
                    onScrollToggle(false);
                    updateValue(evt);
                }}
                onResponderMove={(evt) => {
                    updateValue(evt);
                }}
                onResponderRelease={() => {
                    onScrollToggle(true);
                }}
                onResponderTerminate={() => {
                    onScrollToggle(true);
                }}
            >
                <View pointerEvents="none" style={styles.sliderTrack}>
                    <View style={styles.gradientContainer}>
                        {colors.map((c: string, i: number) => (
                            <View key={i} style={{ flex: 1, backgroundColor: c, height: 24 }} />
                        ))}
                    </View>
                </View>

                {/* Thumb */}
                <View
                    pointerEvents="none"
                    style={[
                        styles.thumb,
                        { left: `${(value / max) * 100}%` }
                    ]}
                >
                    <View style={styles.thumbInner} />
                </View>
            </View>
        </View>
    );
};

export const ManualColorPicker: React.FC<ManualColorPickerProps> = ({ visible, onClose, onColorSelect }) => {
    const [h, setH] = useState(0);
    const [s, setS] = useState(100);
    const [l, setL] = useState(50);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const selectedColor = useMemo(() => hslToHex(h, s, l), [h, s, l]);

    const handleConfirm = () => {
        onColorSelect(selectedColor);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    {/* Decorative Borders */}
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerTR} />
                    <View style={styles.cornerBL} />
                    <View style={styles.cornerBR} />

                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Sparkles size={18} color="#8b4513" style={{ marginRight: 8 }} />
                            <Text style={styles.title}>ALQUIMIA CROMÁTICA</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X color="#3d2b1f" size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        scrollEnabled={scrollEnabled}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 5 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.mainSection}>
                            <View style={styles.previewCard}>
                                <View style={[styles.previewCircle, { backgroundColor: selectedColor }]}>
                                    <View style={styles.innerGlow} />
                                </View>
                                <View style={styles.hexBadge}>
                                    <Text style={styles.hexText}>{selectedColor}</Text>
                                </View>
                            </View>

                            <View style={styles.slidersContainer}>
                                <ColorSlider
                                    label="MATIZ"
                                    value={h}
                                    max={360}
                                    onChange={setH}
                                    colors={['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000']}
                                    onScrollToggle={setScrollEnabled}
                                />

                                <ColorSlider
                                    label="SATURACIÓN"
                                    value={s}
                                    max={100}
                                    onChange={setS}
                                    colors={['#888', selectedColor]}
                                    onScrollToggle={setScrollEnabled}
                                />

                                <ColorSlider
                                    label="ESENCIA (LUM)"
                                    value={l}
                                    max={100}
                                    onChange={setL}
                                    colors={['#000', selectedColor, '#fff']}
                                    onScrollToggle={setScrollEnabled}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <MedievalButton
                                title="DESTILAR COLOR"
                                onPress={handleConfirm}
                                style={{ width: '100%' }}
                            />
                        </View>
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 10, 5, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%',
        backgroundColor: '#F5E6C6',
        borderRadius: 12,
        padding: 24,
        paddingBottom: 10,
        borderWidth: 2,
        borderColor: '#8b4513',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 15,
    },
    cornerTL: { position: 'absolute', top: -10, left: -10, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#D4AF37' },
    cornerTR: { position: 'absolute', top: -10, right: -10, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#D4AF37' },
    cornerBL: { position: 'absolute', bottom: -10, left: -10, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#D4AF37' },
    cornerBR: { position: 'absolute', bottom: -10, right: -10, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#D4AF37' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Cinzel-Bold' : 'serif',
    },
    closeBtn: {
        padding: 5,
    },
    mainSection: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    previewCard: {
        alignItems: 'center',
        marginBottom: 35,
        padding: 20,
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#8b4513',
    },
    previewCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        borderColor: '#3d2b1f',
        overflow: 'hidden',
        position: 'relative',
    },
    innerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 50,
        borderWidth: 15,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    hexBadge: {
        position: 'absolute',
        bottom: -10,
        backgroundColor: '#3d2b1f',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D4AF37',
    },
    hexText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F5E6C6',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    },
    slidersContainer: {
        width: '100%',
    },
    sliderWrapper: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sliderLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8b4513',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    valueLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    sliderTrackContainer: {
        height: 44,
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'transparent',
    },
    sliderTrack: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#ddd',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#3d2b1f',
    },
    gradientContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    thumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#FFD700',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8b4513',
        marginLeft: -10,
        zIndex: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    thumbInner: {
        width: 6,
        height: 6,
        backgroundColor: '#8b4513',
        borderRadius: 3,
    },
    footer: {
        marginTop: 10,
        width: '100%',
    },
});
