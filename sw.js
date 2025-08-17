const CACHE='seers-free-v4';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    '/', '/index.html', '/styles.css', '/app.js', '/manifest.json', '/voc.html', '/voc.js',
    '/icon-192.png', '/icon-512.png', '/seers-logo.png'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
