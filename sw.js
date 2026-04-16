const CACHE_NAME = 'pouchdb-taller-v2';
const OFFLINE_PAGE = './src/html/offline.html';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './src/css/main.css',
  './src/js/app.js',
  './src/html/offline.html',
  './src/html/guia-evidencias.html',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('Recurso no disponible sin conexion', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }),
  );
});
