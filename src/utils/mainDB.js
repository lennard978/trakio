import { openDB } from "idb";

const dbPromise = openDB("trakio-db", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("subscriptions")) {
      db.createObjectStore("subscriptions", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("syncQueue")) {
      db.createObjectStore("syncQueue", { keyPath: "jobId" });
    }
  },
});

export function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/* ---------- Subscriptions ---------- */
export async function saveSubscriptionsLocal(subs) {
  const db = await dbPromise;
  const tx = db.transaction("subscriptions", "readwrite");
  const store = tx.objectStore("subscriptions");
  await store.clear();
  for (const s of subs) await store.put(s);
  await tx.done;
}

export async function loadSubscriptionsLocal() {
  const db = await dbPromise;
  return await db.getAll("subscriptions");
}

/* ---------- Offline Queue ---------- */
export async function queueSyncJob(job) {
  const db = await dbPromise;
  await db.put("syncQueue", {
    jobId: crypto.randomUUID(),
    createdAt: Date.now(),
    ...job,
  });
}

export async function flushQueue({ email, token }) {
  if (!isOnline() || !email || !token) return;

  const db = await dbPromise;
  const jobs = await db.getAll("syncQueue");

  for (const job of jobs) {
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: job.action,
          email,
          ...job.payload,
        }),
      });

      if (!res.ok) throw new Error("sync failed");
      await db.delete("syncQueue", job.jobId);
    } catch {
      break;
    }
  }
}
