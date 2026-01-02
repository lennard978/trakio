// utils/payments.js
export function getNormalizedPayments(subscription, currencyOverride, rates, convert) {
  const list = [];

  const push = (p) => {
    if (!p.id) return; // 🔐 must exist
    list.push(p);
  };

  if (Array.isArray(subscription.payments)) {
    subscription.payments.forEach(push);
  }

  // legacy support (optional)
  if (Array.isArray(subscription.history)) {
    subscription.history.forEach((date) => {
      push({
        id: `${subscription.id}-${date}`, // deterministic fallback
        date,
        amount: subscription.price,
        currency: subscription.currency || "EUR",
      });
    });
  }

  if (convert && currencyOverride && rates) {
    return list.map((p) => ({
      ...p,
      amount: convert(p.amount, p.currency, currencyOverride, rates),
      currency: currencyOverride,
    }));
  }

  return list;
}
