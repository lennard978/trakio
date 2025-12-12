import { useEffect } from "react";

// ✅ Utility must exist!
function computeNextRenewal(datePaid, frequency) {
  if (!datePaid) return null;
  const date = new Date(datePaid);
  if (isNaN(date.getTime())) return null;

  const next = new Date(date);
  const FREQ = {
    monthly: { months: 1 },
    weekly: { days: 7 },
    biweekly: { days: 14 },
    quarterly: { months: 3 },
    semiannual: { months: 6 },
    nine_months: { months: 9 },
    yearly: { months: 12 },
    biennial: { months: 24 },
    triennial: { months: 36 },
  };
  const cfg = FREQ[frequency] || FREQ.monthly;

  if (cfg.months) next.setMonth(date.getMonth() + cfg.months);
  if (cfg.days) next.setDate(date.getDate() + cfg.days);

  return next;
}

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
