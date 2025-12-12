import { useEffect } from "react";
import { computeNextRenewal } from "../utils/renewal";

export default function useNotifications(subscriptions) {
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    const now = new Date();

    subscriptions.forEach((s) => {
      const next = computeNextRenewal(s.datePaid, s.frequency);
      if (!next) return;

      const diff = Math.ceil((next - now) / 86400000);

      if (diff === 0) {
        new Notification(`🔔 ${s.name} is due today!`);
      } else if (diff === 1) {
        new Notification(`📅 ${s.name} is due tomorrow.`);
      }
    });
  }, [subscriptions]);
}
