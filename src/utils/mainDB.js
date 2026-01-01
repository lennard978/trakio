// subscriptions.js
import { openDB } from "idb";

/* ---------------- Constants ---------------- */
const pendingKey = (email) => `pending_subscriptions:${String(email || "anon").toLowerCase()}`;

/* ---------------- LocalStorage Fallback ---------------- */
function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addPending(email, sub) {
  const queue = getPending(email);
  queue.push(sub);
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

/* ---------------- IndexedDB Setup ---------------- */
const dbPromise = openDB("trakio-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("subscriptions")) {
      db.createObjectStore("subscriptions", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("queue")) {
      db.createObjectStore("queue", { autoIncrement: true });
    }
  },
});

/* ---------------- Subscriptions ---------------- */
async function saveSubscriptionsLocal(subs) {
  const db = await dbPromise;
  const tx = db.transaction("subscriptions", "readwrite");
  const store = tx.objectStore("subscriptions");

  await store.clear();
  for (const s of subs) {
    await store.put(s);
  }

  await tx.done;
}

async function loadSubscriptionsLocal() {
  const db = await dbPromise;
  return await db.getAll("subscriptions");
}

/* ---------------- Sync Queue ---------------- */
async function queueSyncJob(job) {
  const db = await dbPromise;
  await db.add("queue", job);
}

async function flushQueue(handler) {
  const db = await dbPromise;
  const all = await db.getAll("queue");

  for (const job of all) {
    await handler(job);
  }

  await db.clear("queue");
}

/* ---------------- Backend Sync ---------------- */
async function syncPending(email, token) {
  const queue = getPending(email);
  if (!queue.length || !email || !token || !isOnline()) return;

  try {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "sync",
        email,
        subscriptions: queue,
      }),
    });

    if (!res.ok) throw new Error("Sync failed");

    clearPending(email);
    console.log("✅ Synced offline subscriptions");
  } catch (err) {
    console.warn("❌ Sync failed. Will retry later.", err);
  }
}

/* ---------------- Public API ---------------- */
export {
  isOnline,
  getPending,
  addPending,
  clearPending,
  syncPending,
  saveSubscriptionsLocal,
  loadSubscriptionsLocal,
  queueSyncJob,
  flushQueue,
};
