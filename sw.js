const CACHE_NAME = 'walid-portfolio-v9';
const urlsToCache = [
  '/',
  '/index.html',
  '/portguardian.html',
  '/style.css',
  '/project-page.css',
  '/script.js',
  '/data/github-stats.json',
  '/images/aura.webp',
  '/images/favicon-32.png',
  '/images/portguardian-icon.png',
  '/images/icon-192.png'
];

const STATIC_DESTINATIONS = new Set(['style', 'script', 'image', 'font']);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';
  const isStaticAsset = isSameOrigin && STATIC_DESTINATIONS.has(event.request.destination);
  const isDataAsset = isSameOrigin && url.pathname.endsWith('.json');

  if (!isSameOrigin && !isNavigation) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (isSameOrigin && response.ok && (isNavigation || isStaticAsset || isDataAsset)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (isNavigation) {
          return caches.match('/index.html');
        }

        throw error;
      }
    })()
  );
});
