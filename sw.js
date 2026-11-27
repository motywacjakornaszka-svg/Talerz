// Service worker aplikacji „Nawyki i Talerz”: działanie offline. Zapytania do API AI zawsze idą prosto do sieci.
// Po każdej zmianie plików podbij numer wersji, żeby telefony pobrały nową wersję.
const VERSION = 'nawyki-talerz-v4.5-1';
const PREFIX = 'nawyki-talerz-';
const SHELL = ['./', './index.html', './style.css', './data.js', './app.js', './talerz.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './favicon.svg'];

self.addEventListener('install', e => {
  // każdy plik osobno – brak jednego pliku nie blokuje instalacji
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // usuwa tylko własne stare wersje (nie rusza pamięci podręcznej starych aplikacji Nawyki i Talerz)
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return;
  // sprawdzanie wersji (fragment pliku) – zawsze prosto z sieci, bez zapisywania
  if (e.request.headers.has('range')) return;
  // czcionki Google (Jedzenie): z sieci, kopia na offline
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(c => fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => c.match(e.request))));
    return;
  }
  if (url.origin !== self.location.origin) return;
  // tylko pliki tej aplikacji (ten sam adres może mieć też stare aplikacje w innych folderach)
  if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  // najpierw sieć (świeża wersja), offline – z pamięci podręcznej
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match(url.pathname.endsWith('talerz.html') ? './talerz.html' : './index.html')))
  );
});

// kliknięcie w przypomnienie (nawyki, pamiętnik, woda) otwiera aplikację
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
