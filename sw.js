'use strict';

const CACHE_NAME = 'tubes-couleurs-v3';
const CACHE_PREFIX = 'tubes-couleurs-';

const PRECACHE = [
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  const appScope = new URL(self.registration.scope);

  if (
    requestUrl.origin !== appScope.origin ||
    !requestUrl.pathname.startsWith(appScope.pathname)
  ) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);

        if (response.ok) {
          await cache.put('./index.html', response.clone());
        }

        return response;
      } catch {
        return (await cache.match('./index.html')) || Response.error();
      }
    }

    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    try {
      const response = await fetch(request);

      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }

      return response;
    } catch {
      return Response.error();
    }
  })());
});
