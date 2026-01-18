import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    Animated,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '..';

const { width, height } = Dimensions.get('window');

// Background image - imported via require if bundled, or absolute path for dev
const BACKGROUND_IMAGE = require('../../../../apps/movil/assets/backgrounds/zen_fireplace.png');

export const ZenFireplaceScreen: React.FC = () => {
    const navigation = useNavigation();
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subtle glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <ScreenWrapper background="#000">
            <Pressable style={styles.container} onLongPress={() => navigation.goBack()}>
                <StatusBar hidden />
                <ImageBackground
                    source={BACKGROUND_IMAGE}
                    style={styles.background}
                    resizeMode="cover"
                >
                    {/* Glow Overlay */}
                    <Animated.View
                        style={[
                            styles.glowOverlay,
                            {
                                opacity: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.1, 0.3],
                                }),
                            },
                        ]}
                    />

                    <View style={styles.content}>
                        <Text style={styles.zenQuote}>"En el silencio de la llama, encontrarás tu propia paz."</Text>
                        <Text style={styles.zenSub}>Mantén pulsado para regresar</Text>
                    </View>
                </ImageBackground>
            </Pressable>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ff8c00', // Deep orange glow
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
    },
    zenQuote: {
        color: '#FFD700',
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingHorizontal: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    zenSub: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 10,
        letterSpacing: 1,
    }
});
