import { dbPromise } from "./mainDB";
import { persistSubscriptions } from "./persistSubscriptions";

export async function enqueueSave(email, subscriptions) {
  const db = await dbPromise;

  await db.put("queue", {
    id: crypto.randomUUID(),
    type: "SAVE_SUBSCRIPTIONS",
    email,
    payload: subscriptions,
    createdAt: Date.now(),
  });
}

export async function flushQueue(token) {
  const db = await dbPromise;
  const tx = db.transaction("queue", "readwrite");
  const store = tx.objectStore("queue");

  const jobs = await store.getAll();

  for (const job of jobs) {
    try {
      if (job.type === "SAVE_SUBSCRIPTIONS") {
        await persistSubscriptions({
          email: job.email,
          token,
          subscriptions: job.payload,
        });
      }

      await store.delete(job.id);
    } catch (err) {
      console.warn("Queue job failed, stopping flush", err);
      break; // stop on first failure
    }
  }

  await tx.done;
}
