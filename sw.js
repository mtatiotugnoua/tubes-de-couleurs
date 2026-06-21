// sw.js — Service Worker de la PWA "Tubes de Couleurs"
// IMPORTANT : quand tu modifies le jeu, change v1 -> v2 (puis v3, etc.)
// pour forcer la mise à jour sur les appareils déjà installés.
const CACHE = 'tubes-couleurs-v1';

// Fichiers mis en cache dès l'installation (fonctionnement hors ligne complet).
const PRECACHE = ['./', './index.html', './style.css', './game.js',
                  './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Stratégie « cache d'abord, puis réseau ».
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
