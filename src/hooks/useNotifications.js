// src/hooks/useNotifications.js
import { useEffect } from "react";
import { computeNextRenewal } from "../utils/renewal";

/**
 * Browser notification hook
 * - Fires at most once per subscription per day
 * - Uses payments[] as the single source of truth
 */
export default function useNotifications(subscriptions) {
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    subscriptions.forEach((s) => {
      if (!s?.id) return;
      if (!Array.isArray(s.payments) || s.payments.length === 0) return;

      const next = computeNextRenewal(s.payments, s.frequency);
      if (!next) return;

      const diff = Math.ceil((next - now) / 86400000);

      // Prevent duplicate notifications per day
      const notifyKey = `notify:${s.id}:${todayKey}`;
      if (localStorage.getItem(notifyKey)) return;

      if (diff === 0) {
        new Notification(`🔔 ${s.name} is due today!`);
        localStorage.setItem(notifyKey, "sent");
      }

      if (diff === 1) {
        new Notification(`📅 ${s.name} is due tomorrow.`);
        localStorage.setItem(notifyKey, "sent");
      }
    });
  }, [subscriptions]);
}
