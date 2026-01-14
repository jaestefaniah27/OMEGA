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
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['active-win'],
              output: {
                format: 'cjs',
                entryFileNames: '[name].js',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: '[name].js',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  base: './', // Ensure relative paths in built index.html
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    commonjsOptions: {
      include: [/packages\//, /node_modules/],
    },
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  resolve: {
    extensions: ['.web.tsx', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: [
      { find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'react-native', replacement: path.resolve(__dirname, './src/mocks/react-native.ts') },
      { find: '@omega/ui', replacement: path.resolve(__dirname, '../../packages/ui/src/index.tsx') },
      { find: '@omega/logic', replacement: path.resolve(__dirname, '../../packages/logic/src/index.ts') },
      { find: 'expo-calendar', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-background-fetch', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-task-manager', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-file-system', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-modules-core', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-camera', replacement: path.resolve(__dirname, './electron/mocks/expo-camera.js') },
      { find: 'expo-image-manipulator', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-notifications', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-status-bar', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-haptics', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: 'expo-localization', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: '@react-native-community/datetimepicker', replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
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
})
