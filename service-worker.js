/* USV St. Marein – Offline-Cache. Version bei Aktualisierung erhöhen. */
const CACHE = 'usv-st-marein-turnier-offline-v1';
const FILES = ['./', './index.html', './logo.png', './foto1.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('usv-st-marein-turnier-offline-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).pathname.endsWith('/index.html')) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put('./index.html', copy)); }
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok) {const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
