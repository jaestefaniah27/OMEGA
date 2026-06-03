import React from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView, StyleSheet,
    ViewStyle, TextStyle, Platform, ActivityIndicator, Modal, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, radius, font } from '../../theme/tokens';

const monoFont = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// ---------------------------------------------------------------- Screen
export const Screen: React.FC<{
    children: React.ReactNode;
    scroll?: boolean;
    padded?: boolean;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
}> = ({ children, scroll = true, padded = true, style, contentStyle }) => {
    const insets = useSafeAreaInsets();
    const pad = padded ? { paddingHorizontal: space.lg } : null;
    const body = (
        <View style={[{ paddingTop: insets.top + space.sm }, pad, contentStyle]}>{children}</View>
    );
    return (
        <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
            {scroll ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl + 56 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {body}
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>{body}</View>
            )}
        </View>
    );
};

// ---------------------------------------------------------------- Header
export const Header: React.FC<{
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    accent?: string;
}> = ({ title, subtitle, right, accent }) => (
    <View style={s.header}>
        <View style={{ flex: 1 }}>
            {accent ? <View style={[s.headerAccent, { backgroundColor: accent }]} /> : null}
            <Text style={s.headerTitle}>{title}</Text>
            {subtitle ? <Text style={s.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
    </View>
);

// ---------------------------------------------------------------- Card
export const Card: React.FC<{
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    onLongPress?: () => void;
    accent?: string;
}> = ({ children, style, onPress, onLongPress, accent }) => {
    const content = (
        <View style={[s.card, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null, style]}>
            {children}
        </View>
    );
    if (onPress || onLongPress) {
        return (
            <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => pressed ? { opacity: 0.7 } : null}>
                {content}
            </Pressable>
        );
    }
    return content;
};

// ---------------------------------------------------------------- Button
type BtnVariant = 'primary' | 'ghost' | 'danger' | 'surface';
export const Button: React.FC<{
    title: string;
    onPress?: () => void;
    variant?: BtnVariant;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    color?: string;
    style?: ViewStyle;
    fullWidth?: boolean;
}> = ({ title, onPress, variant = 'primary', disabled, loading, icon, color, style, fullWidth }) => {
    const accent = color || colors.accent;
    const styles: ViewStyle =
        variant === 'primary' ? { backgroundColor: accent }
        : variant === 'danger' ? { backgroundColor: colors.danger }
        : variant === 'surface' ? { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border }
        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
    const txtColor = variant === 'primary' || variant === 'danger' ? colors.onAccent
        : variant === 'surface' ? colors.text : colors.textMuted;
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                s.btn, styles, fullWidth ? { alignSelf: 'stretch' } : null,
                (disabled || loading) ? { opacity: 0.45 } : null,
                pressed ? { opacity: 0.8 } : null, style,
            ]}
        >
            {loading ? <ActivityIndicator color={txtColor} size="small" /> : (
                <>
                    {icon}
                    <Text style={[s.btnText, { color: txtColor }]}>{title}</Text>
                </>
            )}
        </Pressable>
    );
};

export const IconButton: React.FC<{
    icon: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    active?: boolean;
}> = ({ icon, onPress, style, active }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [
        s.iconBtn, active ? { backgroundColor: colors.accentSoft } : null,
        pressed ? { opacity: 0.6 } : null, style,
    ]}>
        {icon}
    </Pressable>
);

// ---------------------------------------------------------------- TextField
export const TextField: React.FC<{
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    label?: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    secureTextEntry?: boolean;
    multiline?: boolean;
    autoCapitalize?: 'none' | 'sentences';
    style?: ViewStyle;
}> = ({ label, style, ...props }) => (
    <View style={style}>
        {label ? <Text style={s.label}>{label}</Text> : null}
        <TextInput
            placeholderTextColor={colors.textFaint}
            style={[s.input, props.multiline ? { height: 96, textAlignVertical: 'top' } : null]}
            {...props}
        />
    </View>
);

// ---------------------------------------------------------------- NumberStepper
export const NumberStepper: React.FC<{
    value: number;
    onChange: (v: number) => void;
    step?: number;
    min?: number;
    suffix?: string;
}> = ({ value, onChange, step = 1, min = 0, suffix }) => (
    <View style={s.stepper}>
        <Pressable onPress={() => onChange(Math.max(min, value - step))} style={s.stepBtn}>
            <Text style={s.stepSign}>−</Text>
        </Pressable>
        <Text style={s.stepValue}>{value}{suffix ? ` ${suffix}` : ''}</Text>
        <Pressable onPress={() => onChange(value + step)} style={s.stepBtn}>
            <Text style={s.stepSign}>+</Text>
        </Pressable>
    </View>
);

// ---------------------------------------------------------------- SegmentedControl
export const SegmentedControl: React.FC<{
    options: string[];
    value: number;
    onChange: (i: number) => void;
    accent?: string;
}> = ({ options, value, onChange, accent }) => (
    <View style={s.segment}>
        {options.map((opt, i) => (
            <Pressable key={opt} onPress={() => onChange(i)} style={[
                s.segmentItem,
                i === value ? { backgroundColor: accent || colors.accent } : null,
            ]}>
                <Text style={[s.segmentText, i === value ? { color: colors.onAccent, fontWeight: font.weight.bold } : null]}>
                    {opt}
                </Text>
            </Pressable>
        ))}
    </View>
);

// ---------------------------------------------------------------- ListRow
export const ListRow: React.FC<{
    title: string;
    subtitle?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
}> = ({ title, subtitle, left, right, onPress, onLongPress }) => (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [s.row, pressed ? { opacity: 0.6 } : null]}>
        {left ? <View style={{ marginRight: space.md }}>{left}</View> : null}
        <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>{title}</Text>
            {subtitle ? <Text style={s.rowSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
    </Pressable>
);

// ---------------------------------------------------------------- ProgressBar
export const ProgressBar: React.FC<{ progress: number; color?: string; height?: number }> = ({ progress, color, height = 8 }) => (
    <View style={[s.progressTrack, { height, borderRadius: height / 2 }]}>
        <View style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, height: '100%', borderRadius: height / 2, backgroundColor: color || colors.accent }} />
    </View>
);

// ---------------------------------------------------------------- StatPill
export const StatPill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
    <View style={s.statPill}>
        <Text style={[s.statValue, color ? { color } : null]}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
    </View>
);

// ---------------------------------------------------------------- Chip
export const Chip: React.FC<{ label: string; active?: boolean; onPress?: () => void; color?: string }> = ({ label, active, onPress, color }) => (
    <Pressable onPress={onPress} style={[s.chip, active ? { backgroundColor: color || colors.accent, borderColor: color || colors.accent } : null]}>
        <Text style={[s.chipText, active ? { color: colors.onAccent, fontWeight: font.weight.bold } : null]}>{label}</Text>
    </Pressable>
);

// ---------------------------------------------------------------- FAB
export const FAB: React.FC<{ onPress: () => void; icon: React.ReactNode; color?: string }> = ({ onPress, icon, color }) => {
    const insets = useSafeAreaInsets();
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
            s.fab, { bottom: insets.bottom + space.lg, backgroundColor: color || colors.accent },
            pressed ? { opacity: 0.85, transform: [{ scale: 0.96 }] } : null,
        ]}>
            {icon}
        </Pressable>
    );
};

// ---------------------------------------------------------------- BottomSheet (modal)
export const BottomSheet: React.FC<{
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}> = ({ visible, onClose, title, children }) => {
    const insets = useSafeAreaInsets();
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <Pressable style={s.sheetBackdrop} onPress={onClose} />
                <View style={[s.sheet, { paddingBottom: insets.bottom + space.lg }]}>
                    <View style={s.sheetHandle} />
                    {title ? <Text style={s.sheetTitle}>{title}</Text> : null}
                    {children}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ---------------------------------------------------------------- EmptyState
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
    <View style={s.empty}>
        {icon}
        <Text style={s.emptyTitle}>{title}</Text>
        {subtitle ? <Text style={s.emptySubtitle}>{subtitle}</Text> : null}
    </View>
);

// ---------------------------------------------------------------- TimerDisplay
export const TimerDisplay: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color, size = 48 }) => (
    <Text style={{ fontFamily: monoFont, fontSize: size, fontWeight: '700', color: color || colors.text, letterSpacing: 1 }}>{text}</Text>
);

// ---------------------------------------------------------------- Section
export const Section: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
    <View style={{ marginTop: space.xl }}>
        <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{title}</Text>
            {right}
        </View>
        {children}
    </View>
);

const s = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', marginTop: space.md, marginBottom: space.sm },
    headerAccent: { width: 28, height: 3, borderRadius: 2, marginBottom: space.sm },
    headerTitle: { color: colors.text, fontSize: font.size.xxl, fontWeight: font.weight.bold, letterSpacing: -0.5 },
    headerSubtitle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },

    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: colors.border },

    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 48, paddingHorizontal: space.lg, borderRadius: radius.md },
    btnText: { fontSize: font.size.md, fontWeight: font.weight.bold },

    iconBtn: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },

    label: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: font.weight.medium, marginBottom: space.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: font.size.md, paddingHorizontal: space.md, paddingVertical: space.md, minHeight: 48 },

    stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    stepBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    stepSign: { color: colors.text, fontSize: 22, fontWeight: font.weight.bold },
    stepValue: { flex: 1, textAlign: 'center', color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold },

    segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4, gap: 4 },
    segmentItem: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    segmentText: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: font.weight.medium },

    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, paddingHorizontal: space.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: space.sm },
    rowTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.medium },
    rowSubtitle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },

    progressTrack: { backgroundColor: colors.surfaceHigh, overflow: 'hidden', width: '100%' },

    statPill: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: space.md, alignItems: 'center' },
    statValue: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold },
    statLabel: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },

    chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    chipText: { color: colors.textMuted, fontSize: font.size.sm },

    fab: { position: 'absolute', right: space.lg, width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

    sheetBackdrop: { flex: 1, backgroundColor: colors.overlay },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.lg, borderTopWidth: 1, borderColor: colors.border },
    sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: space.lg },
    sheetTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold, marginBottom: space.lg },

    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: space.xxxl, gap: space.sm },
    emptyTitle: { color: colors.textMuted, fontSize: font.size.md, fontWeight: font.weight.medium },
    emptySubtitle: { color: colors.textFaint, fontSize: font.size.sm, textAlign: 'center' },

    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
    sectionTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold },
});
