import { dbPromise } from "./mainDB";
import { persistSubscriptions } from "./persistSubscriptions";
import { loadSubscriptionsLocal } from "./mainDB";

export async function enqueueSave(email) {
  const db = await dbPromise;
  await db.put("queue", {
    id: email,
    email,
    createdAt: Date.now(),
  });
}


export async function flushQueue() {
  if (!navigator.onLine) return;

  const db = await dbPromise;
  const jobs = await db.getAll("queue");

  if (!jobs.length) return;

  // 🔑 ALWAYS read latest local truth
  const subscriptions = await loadSubscriptionsLocal();

  const token = localStorage.getItem("token");

  await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: "save",
      email: jobs[0].email,
      subscriptions,
    }),
  });

  await db.clear("queue");
}
