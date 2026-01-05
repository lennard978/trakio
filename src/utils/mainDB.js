import { openDB } from "idb";

export const dbPromise = openDB("trakio-db", 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore("subscriptions", { keyPath: "id" });
    }

    if (oldVersion < 2) {
      const queue = db.createObjectStore("queue", { keyPath: "id" });
      queue.createIndex("by_created", "createdAt");
    }
  },
});

export async function clearAllLocalData() {
  // IndexedDB
  if (indexedDB?.databases) {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  }

  // Cache Storage (PWA)
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }

  // LocalStorage
  localStorage.clear();
  window.location.replace("/login");

}


/* ------------------------------------------------------------------
 * Subscriptions (OFFLINE CACHE)
 * ------------------------------------------------------------------ */

export async function loadSubscriptionsLocal() {
  const db = await dbPromise;
  return await db.getAll("subscriptions");
}

export async function saveSubscriptionsLocal(subscriptions) {
  const db = await dbPromise;
  const tx = db.transaction("subscriptions", "readwrite");
  const store = tx.objectStore("subscriptions");

  await store.clear();
  for (const sub of subscriptions) {
    await store.put(sub);
  }

  await tx.done;
}
