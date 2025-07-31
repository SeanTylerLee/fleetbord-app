// service-worker.js
const CACHE_NAME = "fieldflex-v1";
const URLS_TO_CACHE = [
  "index.html",
  "login.html",
  "dispatch.html",
  "jobs.html",
  "messages.html",
  "forms.html",
  "dvir.html",
  "safety.html",
  "time.html",
  "dashboard.html",
  "settings.html",
  "styles.css",
  "manifest.json",
  "images/header.jpg",
  "images/icon.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});