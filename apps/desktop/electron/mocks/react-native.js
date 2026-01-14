import * as RNW from 'react-native-web';

export const AccessibilityInfo = RNW.AccessibilityInfo;
export const ActivityIndicator = RNW.ActivityIndicator;
export const Button = RNW.Button;
export const CheckBox = RNW.CheckBox;
export const FlatList = RNW.FlatList;
export const Image = RNW.Image;
export const ImageBackground = RNW.ImageBackground;
export const Keyboard = RNW.Keyboard;
export const KeyboardAvoidingView = RNW.KeyboardAvoidingView;
export const Modal = RNW.Modal;
export const Pressable = RNW.Pressable;
export const RefreshControl = RNW.RefreshControl;
export const SafeAreaView = RNW.SafeAreaView;
export const ScrollView = RNW.ScrollView;
export const SectionList = RNW.SectionList;
export const StatusBar = RNW.StatusBar;
export const StyleSheet = RNW.StyleSheet;
export const Switch = RNW.Switch;
export const Text = RNW.Text;
export const TextInput = RNW.TextInput;
export const Touchable = RNW.Touchable;
export const TouchableHighlight = RNW.TouchableHighlight;
export const TouchableNativeFeedback = RNW.TouchableNativeFeedback;
export const TouchableOpacity = RNW.TouchableOpacity;
export const TouchableWithoutFeedback = RNW.TouchableWithoutFeedback;
export const View = RNW.View;
export const VirtualizedList = RNW.VirtualizedList;
export const Appearance = RNW.Appearance;
export const AppRegistry = RNW.AppRegistry;
export const AppState = RNW.AppState;
export const Animated = RNW.Animated;
export const Dimensions = RNW.Dimensions;
export const Easing = RNW.Easing;
export const InteractionManager = RNW.InteractionManager;
export const KeyboardKeyboard = RNW.KeyboardKeyboard;
export const LayoutAnimation = RNW.LayoutAnimation;
export const Linking = RNW.Linking;
export const PanResponder = RNW.PanResponder;
export const PixelRatio = RNW.PixelRatio;
export const Platform = RNW.Platform;
export const Share = RNW.Share;
export const UIManager = RNW.UIManager;
export const Vibration = RNW.Vibration;
export const useColorScheme = RNW.useColorScheme;
export const useWindowDimensions = RNW.useWindowDimensions;
export const Alert = RNW.Alert; // Add Alert
export const DeviceEventEmitter = RNW.DeviceEventEmitter; // Add DeviceEventEmitter

// Patches
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};

export default RNW;
