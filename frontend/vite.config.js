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
         runtimeCaching: [
           {
             urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
             handler: 'CacheFirst',
             method: 'GET',
             options: {
               cacheName: 'saricart-uploads',
               expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
             },
            },
           {
            // Owner's own data: these change because of the owner's own
            // actions moments earlier (just added a product, just adjusted
            // stock, just edited the store profile) — a stale cached read
            // here would show a list that's missing what they just did.
            // Correctness beats offline convenience for this bucket, so
            // it's NetworkFirst rather than StaleWhileRevalidate. This rule
            // must come before the general /api/products rule below, since
            // Workbox matches routes in registration order and
            // /api/products/mine would otherwise also match that one.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/products/mine') ||
              url.pathname.startsWith('/api/products/stock-history') ||
              url.pathname.startsWith('/api/stores/mine'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'saricart-owner-data',
              networkTimeoutSeconds: 4,
            },
          },
           {
            // Catalog/browsing data: show the cached response instantly,
            // refresh it in the background when online. Good fit for data
            // that's fine being a few minutes stale.
            // Public catalog/browsing data (what customers see): show the
            // cached response instantly, refresh it in the background when
            // online. Good fit for data that's fine being a few minutes
            // stale, since it isn't reflecting the current viewer's own
            // just-made changes.
             urlPattern: ({ url }) =>
               url.pathname.startsWith('/api/products') ||
               url.pathname.startsWith('/api/stores'),
             handler: 'StaleWhileRevalidate',
             method: 'GET',
             options: { cacheName: 'saricart-catalog' },
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
