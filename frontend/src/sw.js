import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Locally-hosted product images (dev only — production serves these from
// Cloudinary, a different origin this rule doesn't cover).
registerRoute(
  ({ url }) => url.pathname.startsWith('/uploads/'),
  new CacheFirst({
    cacheName: 'saricart-uploads',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// Owner's own data: reflects the owner's own just-made changes, so a
// stale cached read would show a list missing what they just did.
// Registered before the general /api/products rule below, since Workbox
// matches routes in registration order.
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/products/mine') ||
    url.pathname.startsWith('/api/products/stock-history') ||
    url.pathname.startsWith('/api/stores/mine'),
  new NetworkFirst({
    cacheName: 'saricart-owner-data',
    networkTimeoutSeconds: 4,
  })
);

// Public catalog/browsing data — fine being a few minutes stale.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/products') || url.pathname.startsWith('/api/stores'),
  new StaleWhileRevalidate({ cacheName: 'saricart-catalog' })
);

// --- Web Push ---

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'SariCart', body: event.data.text() };
  }

  const title = payload.title || 'SariCart';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { link: payload.link || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(link);
      }
    })
  );
});