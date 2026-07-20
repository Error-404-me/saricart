import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'SariCart',
        short_name: 'SariCart',
        description: 'Your neighborhood sari-sari store, online — browse, pre-order, and pick up in store.',
        theme_color: '#123832',
        background_color: '#FFFDF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML) is precached automatically. These are
        // the runtime strategies for everything fetched afterward — the
        // whole point is that a store owner mid-sale on a spotty
        // connection still sees their catalog and can keep scanning.
        runtimeCaching: [
          {
            // Product images rarely change once uploaded — serve from
            // cache first, only hit the network for ones not seen yet.
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            method: 'GET',
            options: {
              cacheName: 'saricart-uploads',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Catalog/browsing data: show the cached response instantly,
            // refresh it in the background when online. Good fit for data
            // that's fine being a few minutes stale.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/products') ||
              url.pathname.startsWith('/api/stores'),
            handler: 'StaleWhileRevalidate',
            method: 'GET',
            options: { cacheName: 'saricart-catalog' },
          },
          {
            // Orders and account data: prefer a fresh answer (status
            // changes matter), but fall back to the last known state
            // instead of failing outright when there's no connection.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/orders') ||
              url.pathname.startsWith('/api/users') ||
              url.pathname.startsWith('/api/analytics'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'saricart-account-data',
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      // Forward API calls to the FastAPI backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Product images are served by the backend too
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
