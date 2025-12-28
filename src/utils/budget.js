import { getNormalizedPayments } from "./payments";

/**
 * Total amount paid this month.
 */
export function getCurrentMonthSpending(subs, currency, rates, convert) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;
  subs.forEach((s) => {
    const payments = getNormalizedPayments(s, currency, rates, convert);
    payments.forEach((p) => {
      const d = new Date(p.date);
      if (d.getFullYear() === y && d.getMonth() === m) {
        total += p.amount;
      }
    });
  });

  return Number(total.toFixed(2));
}

/**
 * Total amount paid this year.
 */
export function getCurrentYearSpending(subs, currency, rates, convert) {
  const now = new Date();
  const y = now.getFullYear();

  let total = 0;
  subs.forEach((s) => {
    const payments = getNormalizedPayments(s, currency, rates, convert);
    payments.forEach((p) => {
      const d = new Date(p.date);
      if (d.getFullYear() === y) {
        total += p.amount;
      }
    });
  });

  return Number(total.toFixed(2));
}

/**
 * Total amount *due* (unpaid) this month.
 */
export function getCurrentMonthDue(subs, currency, rates, convert) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;
  subs.forEach((s) => {
    const payments = getNormalizedPayments(s, currency, rates, convert);
    const hasPaidThisMonth = payments.some((p) => {
      const d = new Date(p.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });

    if (!hasPaidThisMonth) {
      total += convert(s.price, s.currency, currency, rates);
    }
  });

  return Number(total.toFixed(2));
}

/**
 * Total amount *due* (unpaid) this year.
 * Optional — only includes subs not paid at all this year.
 */
export function getCurrentYearDue(subs, currency, rates, convert) {
  const now = new Date();
  const y = now.getFullYear();

  let total = 0;
  subs.forEach((s) => {
    const payments = getNormalizedPayments(s, currency, rates, convert);
    const hasPaidThisYear = payments.some((p) => {
      const d = new Date(p.date);
      return d.getFullYear() === y;
    });

    if (!hasPaidThisYear) {
      total += convert(s.price, s.currency, currency, rates);
    }
  });

  return Number(total.toFixed(2));
}
