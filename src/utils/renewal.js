// src/utils/renewal.js
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

export function computeNextRenewal(datePaid, frequency) {
  if (!datePaid) return null;

  const start = new Date(datePaid);
  if (isNaN(start.getTime())) return null;

  const next = new Date(start);
  const cfg = FREQ[frequency] || FREQ.monthly;

  if (cfg.months) next.setMonth(start.getMonth() + cfg.months);
  if (cfg.days) next.setDate(start.getDate() + cfg.days);

  return next;
}
