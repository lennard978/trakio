import { enqueueSave } from "./offlineQueue";

export async function persistSubscriptions({ email, token, subscriptions }) {
  if (!navigator.onLine) {
    await enqueueSave(email, subscriptions);
    return;
  }

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

  if (!res.ok) {
    // network or server failure → enqueue
    await enqueueSave(email, subscriptions);
    throw new Error("Persist failed, queued for retry");
  }
}
