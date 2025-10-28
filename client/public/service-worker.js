self.addEventListener("install", (event) => {
  console.log("📦 CampusCart Service Worker installing...");
  event.waitUntil(
    caches.open("campuscart-v1").then((cache) =>
      cache.addAll(["/", "/index.html", "/manifest.json", "/nav-icon.png"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener("activate", () => {
  console.log("✅ CampusCart Service Worker activated!");
});