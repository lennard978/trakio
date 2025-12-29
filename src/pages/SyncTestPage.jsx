import React, { useState } from "react";
import {
  getPending,
  addPending,
  clearPending,
  syncPending,
} from "../utils/syncManager";

export default function SyncTestPage() {
  const [queue, setQueue] = useState(getPending());

  const fakeSubscription = {
    id: `sub_${Date.now()}`,
    name: "Test Subscription",
    amount: 9.99,
    currency: "EUR",
    date: new Date().toISOString(),
  };

  const handleAdd = () => {
    localStorage.setItem("user_email", "test@example.com");
    localStorage.setItem("auth_token", "dummy-token");

    addPending(fakeSubscription);
    setQueue(getPending());
    console.log("📦 Added subscription:", fakeSubscription);
  };

  const handleClear = () => {
    clearPending();
    setQueue([]);
    console.log("🧹 Cleared pending queue");
  };

  const handleSync = async () => {
    const email = localStorage.getItem("user_email");
    const token = localStorage.getItem("auth_token");
    await syncPending(email, token);
    setQueue(getPending());
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🔁 Sync Test Page</h1>

      <button onClick={handleAdd}>➕ Add Fake Subscription</button>
      <button onClick={handleSync} style={{ marginLeft: "1rem" }}>
        🚀 Sync Now
      </button>
      <button onClick={handleClear} style={{ marginLeft: "1rem" }}>
        🧹 Clear Queue
      </button>

      <h2 style={{ marginTop: "2rem" }}>📋 Current Pending Subscriptions</h2>
      <pre>{JSON.stringify(queue, null, 2)}</pre>
    </div>
  );
}
