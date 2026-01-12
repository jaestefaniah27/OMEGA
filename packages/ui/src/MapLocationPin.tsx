import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    ViewStyle,
    DimensionValue
} from 'react-native';

interface MapLocationPinProps {
    top: DimensionValue;
    left: DimensionValue;
    title: string;
    icon: string;
    onPress: () => void;
    style?: ViewStyle;
}

/**
 * MapLocationPin: An interactive anchor for the World Map.
 * Positioned absolutely based on top/left coordinates.
 */
export const MapLocationPin: React.FC<MapLocationPinProps> = ({
    top,
    left,
    title,
    icon,
    onPress,
    style
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.container, { top, left }, style]}
        >
            <View style={styles.pinCircle}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{title.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // Center the anchor on its coordinate
        transform: [{ translateX: -40 }, { translateY: -40 }],
        width: 80,
    },
    pinCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderWidth: 2,
        borderColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for depth on map
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 5,
    },
    iconText: {
        fontSize: 24,
    },
    labelContainer: {
        marginTop: 4,
        backgroundColor: '#F5E6C6', // Papyrus
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#3d2b1f',
    },
    labelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3d2b1f',
        textAlign: 'center',
    }
});
