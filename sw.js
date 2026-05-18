const CACHE_NAME = 'krydstogt-v1';

const CACHE_FILES = [
  '/krydstogt/krydstogt-guide.html',
  '/krydstogt/manifest.json',
  '/krydstogt/icon-192.png',
  '/krydstogt/icon-512.png',
  '/krydstogt/apple-touch-icon.png',
  '/krydstogt/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match('/krydstogt/krydstogt-guide.html');
      });
    })
  );
});
