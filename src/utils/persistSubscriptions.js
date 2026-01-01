// src/utils/persistSubscriptions.js

import { saveSubscriptionsLocal } from "./mainDB";
import { enqueueSave } from "./offlineQueue";

export async function persistSubscriptions({ email, token, subscriptions }) {
  if (!email || !Array.isArray(subscriptions)) return;

  // 1️⃣ ALWAYS persist local truth first
  await saveSubscriptionsLocal(subscriptions);

  // 2️⃣ Offline → queue snapshot
  if (!navigator.onLine) {
    await enqueueSave(email, subscriptions);
    return;
  }

  // 3️⃣ Online attempt
  try {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        action: "save",
        email,
        subscriptions,
      }),
    });

    // 4️⃣ Backend rejected → queue snapshot
    if (!res.ok) {
      throw new Error("Backend rejected save");
    }
  } catch (err) {
    // 5️⃣ Network / auth / server failure → queue snapshot
    await enqueueSave(email, subscriptions);
  }
}
