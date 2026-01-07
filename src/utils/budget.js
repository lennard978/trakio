// src/utils/spending.js
import { getNormalizedPayments } from "./payments";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function isSameMonth(date, year, month) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year && date.getMonth() === month;
}

function isSameYear(date, year) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year;
}

function safeNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/* ------------------------------------------------------------------ */
/* Total amount paid this month                                       */
/* ------------------------------------------------------------------ */

export function getCurrentMonthSpending(
  subs = [],
  currency,
  rates,
  convert
) {
  if (!Array.isArray(subs)) return 0;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;

  subs.forEach((s) => {
    if (!s) return;

    let payments = [];
    try {
      payments = getNormalizedPayments(s, currency, rates, convert) || [];
    } catch {
      return;
    }

    payments.forEach((p) => {
      const d = new Date(p.date);
      if (isSameMonth(d, y, m)) {
        total += safeNumber(p.amount);
      }
    });
  });

  return Number(total.toFixed(2));
}

/* ------------------------------------------------------------------ */
/* Total amount paid this year                                        */
/* ------------------------------------------------------------------ */

export function getCurrentYearSpending(
  subs = [],
  currency,
  rates,
  convert
) {
  if (!Array.isArray(subs)) return 0;

  const now = new Date();
  const y = now.getFullYear();

  let total = 0;

  subs.forEach((s) => {
    if (!s) return;

    let payments = [];
    try {
      payments = getNormalizedPayments(s, currency, rates, convert) || [];
    } catch {
      return;
    }

    payments.forEach((p) => {
      const d = new Date(p.date);
      if (isSameYear(d, y)) {
        total += safeNumber(p.amount);
      }
    });
  });

  return Number(total.toFixed(2));
}

/* ------------------------------------------------------------------ */
/* Total amount due (unpaid) this month                                */
/* ------------------------------------------------------------------ */

export function getCurrentMonthDue(
  subs = [],
  currency,
  rates,
  convert
) {
  if (!Array.isArray(subs)) return 0;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;

  subs.forEach((s) => {
    if (!s || typeof convert !== "function") return;

    let payments = [];
    try {
      payments = getNormalizedPayments(s, currency, rates, convert) || [];
    } catch {
      return;
    }

    const hasPaidThisMonth = payments.some((p) =>
      isSameMonth(new Date(p.date), y, m)
    );

    if (!hasPaidThisMonth) {
      try {
        total += safeNumber(
          convert(s.price, s.currency, currency, rates)
        );
      } catch {
        /* ignore conversion failures */
      }
    }
  });

  return Number(total.toFixed(2));
}

/* ------------------------------------------------------------------ */
/* Total amount due (unpaid) this year                                 */
/* Only includes subs not paid at all this year                        */
/* ------------------------------------------------------------------ */

export function getCurrentYearDue(
  subs = [],
  currency,
  rates,
  convert
) {
  if (!Array.isArray(subs)) return 0;

  const now = new Date();
  const y = now.getFullYear();

  let total = 0;

  subs.forEach((s) => {
    if (!s || typeof convert !== "function") return;

    let payments = [];
    try {
      payments = getNormalizedPayments(s, currency, rates, convert) || [];
    } catch {
      return;
    }

    const hasPaidThisYear = payments.some((p) =>
      isSameYear(new Date(p.date), y)
    );

    if (!hasPaidThisYear) {
      try {
        total += safeNumber(
          convert(s.price, s.currency, currency, rates)
        );
      } catch {
        /* ignore conversion failures */
      }
    }
  });

  return Number(total.toFixed(2));
}
