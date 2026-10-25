/* SpekGadget Arena service worker: app shell + data offline.
   Strategi:
   - Navigasi/HTML: network-first, fallback shell cache (offline tetap terbuka).
   - Aset statis: stale-while-revalidate agar cepat dan tetap terbarui.
   - API GET: network-first dengan salinan cache (harga/spek terakhir saat offline).
   - POST (ulasan) tidak pernah dicache. */
const VERSION = "spekgadget-v4";
const SHELL = VERSION + "-shell";
const DATA = VERSION + "-data";
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css?v=33",
  "/app.js?v=33",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-180.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== SHELL && key !== DATA).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStatic(url) {
  return /\.(?:css|js|png|svg|ico|webmanifest|woff2?)$/.test(url.pathname) ||
    url.pathname === "/" || url.pathname === "/index.html";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(DATA).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || new Response(
        JSON.stringify({ error: "Sedang offline. Data terakhir belum tersedia." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )))
    );
    return;
  }
  if (req.mode === "navigate" || isStatic(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match("/index.html")))
    );
  }
});
