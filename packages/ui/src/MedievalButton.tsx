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
    variant?: 'primary' | 'danger';
    style?: ViewStyle;
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
    style
}) => {
    const isPrimary = variant === 'primary';

    const containerStyle = [
        styles.button,
        isPrimary ? styles.primary : styles.danger,
        style
    ];

    const content = (
        <View style={styles.innerContainer}>
            <Text style={styles.text}>{title.toUpperCase()}</Text>
        </View>
    );

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={containerStyle}
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
        minWidth: 120,
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
    innerContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#F5E6C6', // Papyrus color
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
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
    }
});
