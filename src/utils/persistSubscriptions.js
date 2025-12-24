import {
  saveSubscriptionsLocal,
  queueSyncJob
} from "./db";
import { apiFetch } from "./api";

export async function persistSubscriptions(subscriptions) {
  // 1️⃣ Always save locally
  await saveSubscriptionsLocal(subscriptions);

  // 2️⃣ Try backend
  try {
    await apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        action: "save",
        subscriptions,
      }),
    });
  } catch {
    // 3️⃣ Offline → queue
    await queueSyncJob({
      type: "SAVE_SUBSCRIPTIONS",
      payload: subscriptions,
      timestamp: Date.now(),
    });
  }
}
