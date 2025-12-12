// src/utils/migrateLocalToKV.js
export async function migrateLocalToKV(user) {
  if (!user?.id) return;

  const migrated = localStorage.getItem("kv_migrated");
  if (migrated === "true") return;

  const local = JSON.parse(localStorage.getItem("subscriptions") || "[]");
  if (!Array.isArray(local) || local.length === 0) {
    localStorage.setItem("kv_migrated", "true");
    return;
  }

  for (const sub of local) {
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
  }

  localStorage.setItem("kv_migrated", "true");
}
