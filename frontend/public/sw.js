// Minimal service worker — its only job is to make CineRoll installable as a PWA
// (browsers require a registered SW with a fetch handler before offering "Add to
// Home Screen"). It deliberately does NOT cache anything: the fetch handler is a
// no-op, so every request is served by the network exactly as normal and there
// is no risk of users being pinned to a stale build.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Intentionally empty: presence of a fetch handler satisfies installability,
  // while not calling respondWith() lets the browser handle the request itself.
});
