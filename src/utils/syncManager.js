// syncManager.js

export const PENDING_KEY = "pending_subscriptions";

// ✅ Check if device is online
export function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

// ✅ Retrieve all pending subscriptions
export function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ✅ Add a new pending subscription (avoid duplicates)
export function addPending(sub) {
  const queue = getPending();

  const exists = queue.some((q) =>
    (q.id && q.id === sub.id) || (q.clientId && q.clientId === sub.clientId)
  );

  if (!exists) {
    queue.push(sub);
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
  }
}

// ✅ Clear the pending queue
export function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

// 🔁 Try syncing pending subscriptions to backend
export async function syncPending(email, token) {
  const queue = getPending();
  console.log("🚀 Syncing this data:", queue);

  if (!queue.length || !email || !token || !isOnline()) {
    return;
  }

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

    if (!res.ok) throw new Error("Sync failed with status " + res.status);

    clearPending();
    console.log("✅ Synced offline subscriptions successfully");
  } catch (err) {
    console.warn("❌ Sync failed. Will retry when back online.", err);
  }
}

// 🌐 Auto-retry when back online
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    const email = localStorage.getItem("user_email"); // Replace as needed
    const token = localStorage.getItem("auth_token"); // Replace as needed

    if (email && token) {
      await syncPending(email, token);
    }
  });
}
