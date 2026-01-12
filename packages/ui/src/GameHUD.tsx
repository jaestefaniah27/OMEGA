import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform
} from 'react-native';
import { ScrollText, Map, Plus, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface HUDButtonProps {
    onPress: () => void;
    icon: React.ElementType;
    isLarge?: boolean;
    hasBadge?: boolean;
}

const HUDButton: React.FC<HUDButtonProps> = ({
    onPress,
    icon: Icon,
    isLarge,
    hasBadge
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.button,
                isLarge && styles.largeButton
            ]}
        >
            <Icon
                size={isLarge ? 32 : 24}
                color={isLarge ? "#1a1a1a" : "#FFD700"}
                strokeWidth={2}
            />
            {hasBadge && <View style={styles.badge} />}
        </TouchableOpacity>
    );
};

export const GameHUD: React.FC<{
    onProfilePress?: () => void;
    onMapPress?: () => void;
    onZurronPress?: () => void;
}> = ({ onProfilePress, onMapPress, onZurronPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.hudBar}>
                <HUDButton
                    onPress={() => console.log('Tasks')}
                    icon={ScrollText}
                />
                <HUDButton
                    onPress={() => onMapPress?.()}
                    icon={Map}
                />

                {/* Helper view to make space for the floating Zurrón */}
                <View style={styles.spacer} />

                <HUDButton
                    onPress={() => onProfilePress?.()}
                    icon={User}
                />
                <HUDButton
                    onPress={() => console.log('Settings')}
                    icon={ScrollText} // Placeholder for 'Theatre' or similar
                />
            </View>

            {/* Zurrón - Central Floating Button */}
            <View style={styles.zurronContainer}>
                <HUDButton
                    onPress={() => onZurronPress?.()}
                    icon={Plus}
                    isLarge
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    hudBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        width: width * 0.9,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
    },
    button: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    largeButton: {
        backgroundColor: '#FFD700',
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#3d2b1f',
    },
    zurronContainer: {
        position: 'absolute',
        top: -40, // Lift it up
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        width: 60, // Space for the floating button
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e74c3c',
        borderWidth: 1,
        borderColor: '#fff',
    }
});
