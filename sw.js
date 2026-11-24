const CACHE_NAME = 'walid-portfolio-v30';
const urlsToCache = [
  '/offline.html',
  '/style.css',
  '/project-page.css',
  '/script.js?v=20261124',
  '/seo.js',
  '/portguardian-page.js?v=20261021',
  '/homelab-page.js?v=20261021',
  '/vendor/aos/aos.css',
  '/vendor/aos/aos.js',
  '/manifest.json',
  '/data/github-stats.json',
  '/images/aura.webp',
  '/images/favicon-32.png',
  '/images/portguardian-icon.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

const STATIC_DESTINATIONS = new Set(['style', 'script', 'image', 'font', 'video']);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.allSettled(
          urlsToCache.map(async (url) => {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
              }
            } catch (_) {}
          })
        );
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
  if (url.pathname.startsWith('/api/') || url.pathname === '/sync') {
    return;
  }

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
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }

        if (isNavigation) {
          return caches.match('/offline.html');
        }

        throw error;
      }
    })()
  );
});
