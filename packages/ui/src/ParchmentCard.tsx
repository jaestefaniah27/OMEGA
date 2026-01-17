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
    contentStyle?: ViewStyle;
}

export const ParchmentCard: React.FC<ParchmentCardProps> = ({ children, style, contentStyle }) => {
    return (
        <View style={[styles.card, style]}>
            <View style={[styles.innerContent, contentStyle]}>
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
