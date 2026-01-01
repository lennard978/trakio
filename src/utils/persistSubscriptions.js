// src/utils/persistSubscriptions.js

import { saveSubscriptionsLocal } from "./mainDB";
import { enqueueSave } from "./offlineQueue";

export async function persistSubscriptions({ email, token, subscriptions }) {
  if (!email || !Array.isArray(subscriptions)) return;

  // 1️⃣ ALWAYS persist local truth first
  await saveSubscriptionsLocal(subscriptions);

  // 2️⃣ OFFLINE → queue snapshot
  if (!navigator.onLine) {
    await enqueueSave(email, subscriptions);
    return;
  }

  // 3️⃣ ONLINE → try server
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

  // 4️⃣ FAILURE → queue snapshot
  if (!res.ok) {
    await enqueueSave(email, subscriptions);
    throw new Error("Persist failed, queued");
  }
}

