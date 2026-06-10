const CACHE_NAME = 'quickwheel-v3';
// Paths must match the app's base ("/app/"). The SW is registered at
// /app/sw.js so its scope is /app/. Root paths like /index.html 404 here.
const STATIC_ASSETS = [
  '/app/',
  '/app/manifest.json',
  '/app/favicon-32x32.png',
  '/app/icons/icon-192.png',
  '/app/icons/icon-512.png',
  '/app/sounds/win.mp3'
];

// Install - cache static assets. Use individual adds with allSettled so a
// single missing/4xx asset can't reject the whole install and brick the SW
// (which would leave a stale SW serving outdated app code).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('quickwheel-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If it's a navigation request, return the cached app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/app/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
