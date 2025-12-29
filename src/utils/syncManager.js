export const PENDING_KEY = "pending_subscriptions";

export function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

export function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addPending(sub) {
  const queue = getPending();
  queue.push(sub);
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

// 🔁 Sync logic
export async function syncPending(email, token) {
  const queue = getPending();
  if (!queue.length || !email || !token || !isOnline()) return;

  try {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action: "sync",
        email,
        subscriptions: queue
      })
    });

    if (!res.ok) throw new Error("Sync failed");

    clearPending();
    console.log("✅ Synced offline subscriptions");
  } catch (err) {
    console.warn("❌ Sync failed. Will retry later.", err);
  }
}
