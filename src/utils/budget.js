export function getCurrentMonthSpending(subscriptions) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;

  subscriptions.forEach((s) => {
    const payments = [
      ...(s.history || []),
      s.datePaid,
    ].filter(Boolean);

    payments.forEach((d) => {
      const date = new Date(d);
      if (date.getFullYear() === y && date.getMonth() === m) {
        total += s.price;
      }
    });
  });

  return Number(total.toFixed(2));
}
