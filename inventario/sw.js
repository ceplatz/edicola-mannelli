/* Edicola Mannelli — service worker.
   Serve a far aprire l'app anche senza segnale (es. in magazzino): conserva sul dispositivo
   la pagina, il logo, i font e le librerie di Firebase. I DATI (prodotti, foto, registro) NON passano da qui:
   li tiene Firestore nella memoria del dispositivo e li sincronizza da solo quando torna la rete. */
var VERSION = 'edicola-v2';
var CORE = ['./', 'index.html', 'config.js', 'logo.png', 'viridian-logo.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Servizi che devono SEMPRE andare in rete (database, login, file): non li tocchiamo.
var LIVE = /(^|\.)(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebasestorage\.googleapis\.com|firebaseinstallations\.googleapis\.com)$/;
// Librerie e font: cambiano di rado, si possono tenere in cache.
var STATIC_EXT = /(^|\.)(gstatic\.com|googleapis\.com|unpkg\.com)$/;

function networkFirst(req, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var t = setTimeout(function () { // rete lenta o assente: meglio la copia salvata
      caches.match(req, { ignoreSearch: true }).then(function (hit) { if (hit && !done) { done = true; resolve(hit); } });
    }, ms);
    // 'no-cache': chiede sempre al server se la pagina è cambiata (GitHub Pages permette di tenerla 10 minuti nella memoria del browser:
    // senza questo, dopo un aggiornamento si vedrebbe ancora la versione vecchia)
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      clearTimeout(t);
      if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      if (!done) { done = true; resolve(res); }
    }).catch(function () {
      clearTimeout(t);
      caches.match(req, { ignoreSearch: true }).then(function (hit) { if (!done) { done = true; resolve(hit || Response.error()); } });
    });
  });
}

function staleWhileRevalidate(req) {
  return caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit || Response.error(); });
      return hit || net;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return;
  if (LIVE.test(url.hostname)) return;                                   // dati e login: sempre dalla rete
  if (url.origin === self.location.origin) {
    // pagina e configurazione: prima la rete (così gli aggiornamenti arrivano), se manca la copia salvata
    if (req.mode === 'navigate' || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith('/')) {
      e.respondWith(networkFirst(req.mode === 'navigate' ? new Request('index.html') : req, 3500));
    } else {
      e.respondWith(staleWhileRevalidate(req));
    }
    return;
  }
  if (STATIC_EXT.test(url.hostname)) e.respondWith(staleWhileRevalidate(req));
});
