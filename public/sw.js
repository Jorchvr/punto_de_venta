const CACHE = "pg-pos-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });

      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok && res.status === 200 && res.type === "basic") {
            const ct = res.headers.get("content-type") || "";
            if (url.pathname.endsWith(".wasm") && !ct.includes("application/wasm")) {
              return res;
            }
            cache.put(req, res.clone()).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })()
  );
});
