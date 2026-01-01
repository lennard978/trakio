import {
  saveSubscriptionsLocal,
  queueSyncJob,
  isOnline,
} from "./mainDB";

export async function persistSubscriptions({ email, token, subscriptions }) {
  // Always save locally
  await saveSubscriptionsLocal(subscriptions);

  // Offline → queue
  if (!isOnline() || !token) {
    await queueSyncJob({
      action: "save",
      payload: { subscriptions },
    });
    return;
  }

  // Online → save immediately
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: "save",
      email,
      subscriptions,
    }),
  });

  if (!res.ok) throw new Error("Persist failed");
}
