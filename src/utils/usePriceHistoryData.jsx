import { useMemo } from "react";
import { getNormalizedPayments } from "./payments";

function getLast12Months() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return d.toISOString().slice(0, 7);
  });
}

export function usePriceHistoryData(subscriptions = [], months = 12) {
  return useMemo(() => {
    const series = {};
    const now = new Date();

    subscriptions.forEach((sub) => {
      const payments = getNormalizedPayments(sub) || [];

      // 1️⃣ Build map of known prices per month
      const priceByMonth = {};

      payments.forEach((p) => {
        const key = new Date(p.date).toISOString().slice(0, 7);
        priceByMonth[key] = p.amount;
      });

      // 2️⃣ Determine last known price
      const sortedMonths = Object.keys(priceByMonth).sort();
      const lastKnownPrice =
        priceByMonth[sortedMonths.at(-1)] ?? sub.price;

      // 3️⃣ Generate last N months
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7);

        if (!series[key]) series[key] = { month: key };

        series[key][sub.name] =
          priceByMonth[key] ??
          series[key]?.[sub.name] ??
          lastKnownPrice;
      }
    });

    return Object.values(series).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [subscriptions, months]);
}
