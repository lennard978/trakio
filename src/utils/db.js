import { openDB } from "idb";

export const dbPromise = openDB("trakio-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("subscriptions")) {
      db.createObjectStore("subscriptions", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("queue")) {
      db.createObjectStore("queue", {
        autoIncrement: true,
      });
    }
  },
});

/* ---------------- Subscriptions ---------------- */

export async function saveSubscriptionsLocal(subs) {
  const db = await dbPromise;
  const tx = db.transaction("subscriptions", "readwrite");
  const store = tx.objectStore("subscriptions");

  await store.clear();
  for (const s of subs) {
    await store.put(s);
  }

  await tx.done;
}

export async function loadSubscriptionsLocal() {
  const db = await dbPromise;
  return await db.getAll("subscriptions");
}

/* ---------------- Sync Queue ---------------- */

export async function queueSyncJob(job) {
  const db = await dbPromise;
  await db.add("queue", job);
}

export async function flushQueue(handler) {
  const db = await dbPromise;
  const all = await db.getAll("queue");

  for (const job of all) {
    await handler(job);
  }

  await db.clear("queue");
}
