import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['active-win'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  resolve: {
    extensions: ['.web.tsx', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: [
      { find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'react-native', replacement: path.resolve(__dirname, './electron/mocks/react-native.js') },
      { find: '@omega/ui', replacement: path.resolve(__dirname, '../../packages/ui/src/index.tsx') },
      { find: '@omega/logic', replacement: path.resolve(__dirname, '../../packages/logic/src/index.ts') },
      { find: 'expo-calendar', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-background-fetch', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-task-manager', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-file-system', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-modules-core', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-camera', replacement: path.resolve(__dirname, './electron/mocks/expo-camera.js') },
      { find: 'expo-image-manipulator', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-notifications', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-status-bar', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-haptics', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: 'expo-localization', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
      { find: '@react-native-community/datetimepicker', replacement: path.resolve(__dirname, './electron/mocks/empty.js') },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: ['lucide-react-native', 'react-native-web', 'react-native-url-polyfill'],
    exclude: ['@omega/ui', '@omega/logic'], // Don't pre-bundle these, let Vite process them as source
  },
  build: {
    commonjsOptions: {
      include: [/packages\//, /node_modules/],
    },
  },
})
