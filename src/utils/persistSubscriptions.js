import { saveSubscriptionsLocal } from "./mainDB";
import { enqueueSave } from "./offlineQueue";

export async function persistSubscriptions({ email, token, subscriptions }) {
  // ✅ ALWAYS write locally first
  await saveSubscriptionsLocal(subscriptions);

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
    await enqueueSave(email);
    throw new Error("Persist failed, queued");
  }
}
