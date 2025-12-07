// ====== CONFIG ======
const CACHE_NAME = "subscription-tracker-v4";

const urlsToCache = [
  "/subscription-tracker/",
  "/subscription-tracker/index.html",
];


// ====== INSTALL ======
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});


// ====== ACTIVATE ======
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});


// ====== FETCH (fixed offline fallback) ======
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch(() =>
        caches.match("/subscription-tracker/index.html")
      );
    })
  );
});


// ====== RENEWAL NOTIFICATION LOGIC ======
self.addEventListener("message", (event) => {
  const { type, subscriptions } = event.data || {};
  if (type !== "CHECK_RENEWALS") return;

  const today = new Date();

  subscriptions.forEach((sub) => {
    if (!sub.renewalDate) return;

    const renewalDate = new Date(sub.renewalDate);
    const diff = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

    if (diff === 1 && self.registration.showNotification) {
      self.registration.showNotification("Upcoming Renewal", {
        body: `${sub.name} renews tomorrow (€${sub.price})`,
        icon: "/subscription-tracker/icons/icon-192.png",
        badge: "/subscription-tracker/icons/icon-192.png"
      });
    }
  });
});


// ====== NOTIFICATION CLICK ======
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.includes("/subscription-tracker/") && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow("/subscription-tracker/");
        }
      })
  );
});
