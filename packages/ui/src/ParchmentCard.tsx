import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    ImageBackground
} from 'react-native';

interface ParchmentCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

/**
 * ParchmentCard: A container component that simulates the look of a parchment scroll.
 * Uses #F5E6C6 (Papyrus/Parchment) background by default.
 */
export const ParchmentCard: React.FC<ParchmentCardProps> = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {/* 
        TODO: Once assets are available, use ImageBackground for irregular parchment edges:
        <ImageBackground 
          source={require('../assets/textures/parchment_bg.png')}
          style={styles.background}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.innerContent}>
            {children}
          </View>
        </ImageBackground>
      */}
            <View style={styles.innerContent}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F5E6C6', // Papyrus color
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d4c5a9',
        // Realistic shadow for paper
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
        overflow: 'hidden',
    },
    innerContent: {
        padding: 20,
    },
    background: {
        width: '100%',
    },
    imageStyle: {
        resizeMode: 'stretch',
    }
});
