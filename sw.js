/* Service worker — coque hors ligne. Cache versionné : une nouvelle version = nouveau nom de cache. */
const CACHE = 'ggl-1.0.09fd6d67';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'diagnostic.html', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ggl-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => r.mode === 'navigate' ? caches.match('index.html') : Response.error())));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {   // polices : stale-while-revalidate
    e.respondWith(caches.open('ggl-fonts').then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
  }
});
