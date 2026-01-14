import * as RNW from 'react-native-web';

// Helper to get or mock
const getOrMock = (name: string, fallback: any = {}) => {
  return (RNW as any)[name] !== undefined ? (RNW as any)[name] : fallback;
};

// Explicit exports to satisfy ESM imports
export const AccessibilityInfo = getOrMock('AccessibilityInfo');
export const ActivityIndicator = getOrMock('ActivityIndicator');
export const Button = getOrMock('Button');
export const CheckBox = getOrMock('CheckBox');
export const FlatList = getOrMock('FlatList');
export const Image = getOrMock('Image');
export const ImageBackground = getOrMock('ImageBackground');
export const Keyboard = getOrMock('Keyboard');
export const KeyboardAvoidingView = getOrMock('KeyboardAvoidingView');
export const Modal = getOrMock('Modal');
export const Pressable = getOrMock('Pressable');
export const RefreshControl = getOrMock('RefreshControl');
export const SafeAreaView = getOrMock('SafeAreaView');
export const ScrollView = getOrMock('ScrollView');
export const SectionList = getOrMock('SectionList');
export const StatusBar = getOrMock('StatusBar');
export const StyleSheet = getOrMock('StyleSheet');
export const Switch = getOrMock('Switch');
export const Text = getOrMock('Text');
export const TextInput = getOrMock('TextInput');
export const Touchable = getOrMock('Touchable');
export const TouchableHighlight = getOrMock('TouchableHighlight');
export const TouchableNativeFeedback = getOrMock('TouchableNativeFeedback');
export const TouchableOpacity = getOrMock('TouchableOpacity');
export const TouchableWithoutFeedback = getOrMock('TouchableWithoutFeedback');
export const View = getOrMock('View');
export const VirtualizedList = getOrMock('VirtualizedList');
export const Appearance = getOrMock('Appearance');
export const AppRegistry = getOrMock('AppRegistry');
export const AppState = getOrMock('AppState');
export const Animated = getOrMock('Animated');
export const Dimensions = getOrMock('Dimensions');
export const Easing = getOrMock('Easing');
export const InteractionManager = getOrMock('InteractionManager');
export const LayoutAnimation = getOrMock('LayoutAnimation');
export const Linking = getOrMock('Linking');
export const PanResponder = getOrMock('PanResponder');
export const PixelRatio = getOrMock('PixelRatio');
export const Platform = getOrMock('Platform');
export const Share = getOrMock('Share');
export const UIManager = getOrMock('UIManager', {});
export const Vibration = getOrMock('Vibration');
export const useColorScheme = getOrMock('useColorScheme', () => 'light');
export const useWindowDimensions = getOrMock('useWindowDimensions');
export const Alert = getOrMock('Alert', { alert: () => {} });
export const DeviceEventEmitter = getOrMock('DeviceEventEmitter', {
  addListener: () => ({ remove: () => {} }),
  emit: () => {},
});
export const processColor = getOrMock('processColor', (c: any) => c);
export const findNodeHandle = getOrMock('findNodeHandle', () => null);
export const I18nManager = getOrMock('I18nManager', { isRTL: false });
export const NativeModules = getOrMock('NativeModules', {});

// Additional patches often needed by native modules
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};

export default RNW;
