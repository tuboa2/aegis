import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ],
      },
      manifest: {
        name: 'Aegis - Disaster Monitoring',
        short_name: 'Aegis',
        description: 'AI-Powered Disaster Monitoring & Preparedness Platform',
        theme_color: '#3b82f6',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        categories: ['weather', 'news', 'productivity'],
        icons: [
          {
            src: 'aegis-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'aegis-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'aegis-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'aegis-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        // TODO: Screenshots
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module'
      } 
    })
  ],
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
  },
})
