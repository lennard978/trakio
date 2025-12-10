import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const freqMap = {
  weekly: { days: 7 },
  biweekly: { days: 14 },
  monthly: { months: 1 },
  quarterly: { months: 3 },
  semiannual: { months: 6 },
  nine_months: { months: 9 },
  yearly: { months: 12 },
  biennial: { months: 24 },
  triennial: { months: 36 },
};

export default function useNotifications(subscriptions) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) return;

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(checkRenewals, 24 * 60 * 60 * 1000);
    checkRenewals();

    return () => clearInterval(interval);
  }, [subscriptions]);

  function notify(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/subscription-tracker/icon-192.png",
      });
    }
  }

  function checkRenewals() {
    const today = new Date();

    subscriptions.forEach((sub) => {
      if (!sub.datePaid || sub.notify === false) return;

      const cfg = freqMap[sub.frequency] || { months: 1 };

      const paid = new Date(sub.datePaid);
      const next = new Date(paid);

      if (cfg.months) next.setMonth(next.getMonth() + cfg.months);
      if (cfg.days) next.setDate(next.getDate() + cfg.days);

      const reminders = [5, 3];

      reminders.forEach((d) => {
        const reminder = new Date(next);
        reminder.setDate(next.getDate() - d);

        if (reminder.toDateString() === today.toDateString()) {
          notify(
            t("notification_title"),
            t("notification_body", {
              name: sub.name,
              date: next.toLocaleDateString()
            })
          );

        }
      });
    });
  }
}
