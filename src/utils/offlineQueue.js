// src/utils/offlineQueue.js

import { dbPromise } from "./mainDB";

/* -------------------------------------------------
 * Queue one FULL snapshot per offline action
 * ------------------------------------------------- */

export async function enqueueSave(email, subscriptions) {
  if (!email || !Array.isArray(subscriptions)) return;

  const db = await dbPromise;

  // 🔥 IMPORTANT: keep ONLY latest snapshot
  const existing = await db.getAll("queue");

  for (const job of existing) {
    if (job.email === email) {
      await db.delete("queue", job.id);
    }
  }

  await db.add("queue", {
    id: crypto.randomUUID(),
    email,
    subscriptions,
    createdAt: Date.now(),
  });
}


/* -------------------------------------------------
 * Flush queue (FIFO, safe, idempotent)
 * ------------------------------------------------- */

export async function flushQueue() {
  if (!navigator.onLine) return;

  const token = localStorage.getItem("token");
  if (!token) return; // ✅ GUARD

  const db = await dbPromise;
  const jobs = await db.getAllFromIndex("queue", "by_created");
  if (!jobs.length) return;

  for (const job of jobs) {
    if (!job.email || !job.subscriptions) {
      await db.delete("queue", job.id);
      continue;
    }

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "save",
        email: job.email,
        subscriptions: job.subscriptions,
      }),
    });

    if (!res.ok) return;
    await db.delete("queue", job.id);
  }
}

