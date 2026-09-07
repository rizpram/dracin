/* DRACIN Service Worker — app-shell cache, network-first untuk API & navigasi */
const CACHE = 'dracin-v1';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API / provider upstream: network-only, jangan cache (data selalu fresh)
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) return;

  // Navigasi SPA: network-first, fallback ke app shell saat offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('/index.html', copy)); return res; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Aset statis (js/css/png/ico/svg/webmanifest): stale-while-revalidate
  if (/\.(js|css|png|ico|svg|webmanifest|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
