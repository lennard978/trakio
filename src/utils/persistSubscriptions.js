// persistAndSyncSubscriptions.js

import {
  saveSubscriptionsLocal,
  queueSyncJob
} from "./db";
import { apiFetch } from "./api";

const PENDING_KEY = "pending_subscriptions";

// Utility: Online check
export function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

// Utility: Get pending queue
export function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Utility: Add item to queue (prevent duplicates)
export function addPending(sub) {
  const queue = getPending();

  // Add only if unique (assumes sub.id or sub.clientId exists)
  const exists = queue.some((q) => q.id === sub.id || q.clientId === sub.clientId);
  if (!exists) {
    queue.push(sub);
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
  }
}

// Utility: Clear queue
export function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

// 🔁 Sync function
export async function syncPending(email, token) {
  const queue = getPending();
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

    clearPending();
    console.log("✅ Synced offline subscriptions");
  } catch (err) {
    console.warn("❌ Sync failed. Will retry later.", err);
  }
}

// 🧠 Persist logic
export async function persistSubscriptions(subscriptions) {
  // Save to local storage / IndexedDB
  await saveSubscriptionsLocal(subscriptions);

  try {
    await apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        action: "save",
        subscriptions,
      }),
    });
  } catch (err) {
    console.warn("⚠️ Persist to backend failed, queueing for later sync.");
    await queueSyncJob({
      type: "SAVE_SUBSCRIPTIONS",
      payload: subscriptions,
      timestamp: Date.now(),
    });

    // Add to offline queue for retry
    subscriptions.forEach(addPending);
  }
}

// 🌐 Auto-sync on network reconnection
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    console.log("🌐 Network back online. Attempting to sync...");

    // Replace these with your own auth/email retrieval logic
    const email = localStorage.getItem("user_email");
    const token = localStorage.getItem("auth_token");

    if (email && token) {
      await syncPending(email, token);
    }
  });
}
