// Service worker Talerza: działa offline, nie dotyka zapytań do API AI.
// Po każdej zmianie plików aplikacji podbij numer wersji, żeby telefony pobrały nową wersję.
const VERSION = 'talerz-v10';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.svg',
  './screenshot-dzis.png',
  './screenshot-plyny.png'
];

self.addEventListener('install', e => {
  // Każdy plik osobno – brak jednego pliku nie blokuje działania aplikacji.
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return; // pomijaj blob:/data: (zdjęcia)
  // Fonty Google: z sieci, kopia w cache na offline.
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(VERSION).then(c =>
        fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => c.match(e.request))
      )
    );
    return;
  }
  if (url.origin !== self.location.origin) return; // API Gemini/Claude – zawsze bezpośrednio do sieci
  // Pliki aplikacji: najpierw sieć (świeża wersja), offline – z cache.
  // cache: 'no-cache' – zawsze pytaj serwer o nowszą wersję (GitHub Pages każe przeglądarce trzymać pliki 10 min).
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

// Kliknięcie w przypomnienie o wodzie otwiera aplikację.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./');
    })
  );
});
