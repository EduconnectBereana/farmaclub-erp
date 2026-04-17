const VERSION = 'farmaclub-public-v2';
const PUBLIC_SHELL = ['/', '/site', '/comprar', '/motoboy', '/erp', '/piloto', '/public/manifest-cliente.json', '/public/manifest-motoboy.json'];

function isSensitive(url) {
  return url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/rest/v1/') ||
    url.pathname.startsWith('/auth/v1/') ||
    url.pathname.includes('erp_') ||
    url.pathname.includes('central') ||
    url.pathname.includes('contabilidade') ||
    url.pathname.includes('compra_coletiva') ||
    url.pathname.includes('setup') ||
    url.pathname.includes('seguranca');
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PUBLIC_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (isSensitive(url)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(VERSION).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('/site'))));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => {
    const network = fetch(event.request).then(resp => {
      if (resp.ok) {
        const copy = resp.clone();
        caches.open(VERSION).then(cache => cache.put(event.request, copy));
      }
      return resp;
    }).catch(() => cached);
    return cached || network;
  }));
});
