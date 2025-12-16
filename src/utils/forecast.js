import { computeNextRenewal } from "./renewal";

/**
 * Forecast total spend between two dates
 */
export function forecastSpend({
  subscriptions,
  fromDate,
  toDate,
  currency,
  rates,
  convert,
}) {
  let total = 0;
  const byCategory = {};

  subscriptions.forEach((s) => {
    if (!s?.datePaid || !s?.price) return;

    let next = computeNextRenewal(s.datePaid, s.frequency);
    if (!next) return;

    while (next <= toDate) {
      if (next >= fromDate) {
        const baseCurrency = s.currency || "EUR";
        const amount =
          rates && convert
            ? convert(s.price, baseCurrency, currency, rates)
            : s.price;

        total += amount;

        const cat = s.category || "other";
        byCategory[cat] = (byCategory[cat] || 0) + amount;
      }

      next = computeNextRenewal(next, s.frequency);
      if (!next) break;
    }
  });

  return {
    total,
    byCategory,
  };
}
