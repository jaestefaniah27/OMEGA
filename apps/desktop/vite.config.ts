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
      { find: 'react-native', replacement: 'react-native-web' },
      { find: 'expo-camera', replacement: path.resolve(__dirname, './src/mocks/expo.tsx') },
      { find: 'expo-image-manipulator', replacement: path.resolve(__dirname, './src/mocks/expo.tsx') },
      { find: 'expo-haptics', replacement: path.resolve(__dirname, './src/mocks/expo.tsx') },
      { find: /^expo-.*/, replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: /^@react-native-community\/.*/, replacement: path.resolve(__dirname, './src/mocks/empty.ts') },
      { find: '@omega/ui', replacement: path.resolve(__dirname, '../../packages/ui/src/index.tsx') },
      { find: '@omega/logic', replacement: path.resolve(__dirname, '../../packages/logic/src/index.ts') },
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
