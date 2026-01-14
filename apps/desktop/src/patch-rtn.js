// Polyfill Buffer for React Native libraries running in Electron/Browser
global.Buffer = global.Buffer || require('buffer').Buffer;
