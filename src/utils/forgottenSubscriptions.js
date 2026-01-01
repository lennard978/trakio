export function getForgottenSubscriptions(subscriptions, thresholdDays = 30) {
  const now = Date.now();

  return (subscriptions || [])
    .map((s) => {
      const paymentDates = Array.isArray(s.payments)
        ? s.payments.map((p) => p?.date)
        : [...(s.history || []), s.datePaid];

      const valid = paymentDates.filter(Boolean);
      if (!valid.length) return null;

      const lastPaidTs = Math.max(...valid.map((d) => new Date(d).getTime()));
      const overdueDays = Math.floor((now - lastPaidTs) / (1000 * 60 * 60 * 24));

      return overdueDays > thresholdDays ? { ...s, overdueDays } : null;
    })
    .filter(Boolean);
}
