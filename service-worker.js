self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('login-app-v1').then(function(cache) {
      return cache.addAll([
        './',
        './login.html',
        './admin.html',
        './driver.html',
        './style.css',
        './script.js',
        './manifest.json'
      ]);
    })
  );
});
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});