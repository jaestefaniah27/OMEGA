import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ImageBackground,
    View
} from 'react-native';

interface MedievalButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'danger';
    style?: ViewStyle;
    disabled?: boolean;
    icon?: React.ReactNode;
}

/**
 * MedievalButton: A themed button for the OMEGA project.
 * Simulates stone (primary) or wood (danger) aesthetics.
 * Ready for ImageBackground textures.
 */
export const MedievalButton: React.FC<MedievalButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    style,
    disabled,
    icon
}) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const containerStyle = [
        styles.button,
        styles.button,
        isPrimary ? styles.primary : (isSecondary ? styles.secondary : styles.danger),
        disabled && styles.disabled,
        style
    ];

    const content = (
        <View style={styles.innerContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, disabled && styles.disabledText]}>{title.toUpperCase()}</Text>
        </View>
    );

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={containerStyle}
            disabled={disabled}
        >
            {/* 
        TODO: Once assets are available, wrap content in ImageBackground:
        <ImageBackground 
          source={isPrimary ? require('../assets/textures/stone.png') : require('../assets/textures/wood.png')}
          style={styles.background}
          imageStyle={styles.imageStyle}
        >
          {content}
        </ImageBackground>
      */}
            {content}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFD700', // Gold border
        overflow: 'hidden',
        minWidth: 80,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    primary: {
        backgroundColor: '#4a4a4a', // Stone placeholder
    },
    danger: {
        backgroundColor: '#8b4513', // Wood placeholder
    },
    secondary: {
        backgroundColor: '#2c3e50', // Dark Blue placeholder
        borderColor: '#C0C0C0', // Silver border
    },
    innerContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: '#F5E6C6', // Papyrus color
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    background: {
        width: '100%',
        height: '100%',
    },
    imageStyle: {
        resizeMode: 'cover',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#666',
        borderColor: '#999',
    },
    disabledText: {
        color: '#ccc',
        textShadowColor: 'transparent',
    }
});
