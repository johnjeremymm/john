/* sw.js  -  service worker ng "Let's Connect" page. Dalawa ang trabaho:
   1. iOS "Save contact": sinasagot ang /contact.vcf gamit ang vCard na itinago ng script.js sa Cache API
      (Content-Type text/vcard, Content-Disposition inline), kaya bubukas ang native contact card ng Safari.
   2. OFFLINE: pagkatapos ng unang bukas na may data, naka-save ang page, script, style at mga picture sa phone.
      Network-first ito: kapag may signal, laging bago ang kinukuha. Kapag walang signal (o mabagal ang net
      nang mahigit 3 segundo), ang naka-save ang ginagamit. Walang binabago sa ibang site (Google Fonts, social links).
   Ilagay ito sa parehong folder ng index.html. Kailangan ng https (o localhost). */
const VCF_CACHE = "linkertap-vcf-v1";
const STATIC_CACHE = "linkertap-static-v1";
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "config.js",
  "script.js",
  "pfp.jpg",
  "apple-touch-icon.png",
];
const SLOW_MS = 3000;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(STATIC_CACHE)
      // isa-isa, para kapag may isang file na wala, hindi nasisira ang lahat
      .then((c) =>
        Promise.all(
          ASSETS.map((p) =>
            c.add(new URL(p, self.registration.scope).href).catch(() => {}),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      // buburahin ang lumang static cache lang; hindi ginagalaw ang VCF_CACHE
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) => k.startsWith("linkertap-static-") && k !== STATIC_CACHE,
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);

function networkFirst(req) {
  const net = fetch(req).then((res) => {
    if (res && res.status === 200 && res.type === "basic") {
      const copy = res.clone();
      caches
        .open(STATIC_CACHE)
        .then((c) => c.put(req, copy))
        .catch(() => {});
    }
    return res;
  });
  return caches.open(STATIC_CACHE).then(async (c) => {
    let hit = await c.match(req, { ignoreSearch: true });
    if (!hit && req.mode === "navigate")
      hit = await c.match(new URL("index.html", self.registration.scope).href);
    if (!hit) return net; // wala pang naka-save: network lang
    // may naka-save: kapag walang net o sobrang bagal, iyon ang gamitin
    return Promise.race([
      net.catch(() => hit),
      new Promise((ok) => setTimeout(() => ok(hit), SLOW_MS)),
    ]);
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (/\/contact\.vcf$/.test(u.pathname)) {
    e.respondWith(
      caches
        .open(VCF_CACHE)
        .then((c) => c.match(u.origin + u.pathname))
        .then(
          (r) =>
            r ||
            new Response(
              "The contact card is not ready yet. Go back and tap Save contact again.",
              {
                status: 404,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              },
            ),
        ),
    );
    return;
  }
  // ibang site (fonts, social links) at Range requests: hindi pinakikialaman
  if (u.origin !== self.location.origin || req.headers.has("range")) return;
  e.respondWith(networkFirst(req));
});