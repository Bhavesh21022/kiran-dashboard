// KIRAN service worker — caches the app shell + last-fetched risk data
// so the dashboard still shows something useful with no connection.
const CACHE_NAME = "kiran-cache-v1";
const APP_SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Supabase REST calls (thermal_index reads): network-first, fall back to
  // the last cached response so the last-known risk data still shows offline.
  if (request.url.includes("/rest/v1/thermal_index")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else: cache-first for the app shell.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
