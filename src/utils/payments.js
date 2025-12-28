// utils/payments.js
export function getNormalizedPayments(subscription, currencyOverride, rates, convert) {
  const seen = new Set();
  const list = [];

  const pushUnique = (p) => {
    const key = `${new Date(p.date).toISOString()}|${p.amount}|${p.currency}`;
    if (!seen.has(key)) {
      seen.add(key);
      list.push(p);
    }
  };

  if (Array.isArray(subscription.history)) {
    subscription.history.forEach((date) => {
      pushUnique({
        date,
        amount: subscription.price,
        currency: subscription.currency || "EUR",
      });
    });
  }

  if (subscription.datePaid) {
    pushUnique({
      date: subscription.datePaid,
      amount: subscription.price,
      currency: subscription.currency || "EUR",
    });
  }

  if (Array.isArray(subscription.payments)) {
    subscription.payments.forEach(pushUnique);
  }

  // Optional: apply currency conversion here if desired
  if (convert && currencyOverride && rates) {
    return list.map((p) => ({
      ...p,
      amount: convert(p.amount, p.currency, currencyOverride, rates),
      currency: currencyOverride,
    }));
  }

  return list;
}
