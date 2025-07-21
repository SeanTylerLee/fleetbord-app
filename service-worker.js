// Unique cache name -- change this to force update if needed
const CACHE_NAME = 'fleetbord-cache-v1';

// List of files to cache (add all your static files here)
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png', // ← Optional: add your icons/images
  '/icons/icon-512.png'
];

// Install event -- caches all necessary files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting(); // Forces the new SW to activate immediately
});

// Activate event -- cleans up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Lets the SW start controlling open pages right away
});

// Fetch event -- serves files from cache, falls back to network
self.addEventListener('fetch', event => {
  // Only intercept GET requests (skip POST, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache hit, or fetch from network if not cached
        return response || fetch(event.request);
      })
      .catch(err => {
        // Optional: fallback response when offline and not cached
        console.warn('[ServiceWorker] Fetch failed; returning offline fallback');
        return new Response('You are offline.', { status: 503 });
      })
  );
});