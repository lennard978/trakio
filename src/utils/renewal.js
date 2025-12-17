// src/utils/renewal.js

const FREQ = {
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

/**
 * NEW — canonical implementation (payments[])
 */
export function computeNextRenewalFromPayments(payments, frequency) {
  if (!Array.isArray(payments) || payments.length === 0) return null;

  const lastDate = new Date(
    Math.max(...payments.map((p) => new Date(p.date)))
  );

  if (isNaN(lastDate.getTime())) return null;

  return computeFromDate(lastDate, frequency);
}

/**
 * BACKWARD-COMPATIBLE export
 * Used by existing components (UpcomingPayments, etc.)
 *
 * Accepts:
 * - payments[] (new)
 * - datePaid string (legacy)
 */
export function computeNextRenewal(input, frequency) {
  // NEW path: payments[]
  if (Array.isArray(input)) {
    return computeNextRenewalFromPayments(input, frequency);
  }

  // LEGACY path: datePaid
  if (!input) return null;

  const date = new Date(input);
  if (isNaN(date.getTime())) return null;

  return computeFromDate(date, frequency);
}

/* ---------------- Internal helper ---------------- */

function computeFromDate(start, frequency) {
  const cfg = FREQ[frequency] || FREQ.monthly;
  const next = new Date(start);

  if (cfg.months) next.setMonth(start.getMonth() + cfg.months);
  if (cfg.days) next.setDate(start.getDate() + cfg.days);

  return next;
}
