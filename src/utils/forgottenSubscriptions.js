import { computeNextRenewal } from "./renewal";

const GRACE_BY_FREQUENCY = {
  weekly: 30,
  biweekly: 30,
  monthly: 60,
  quarterly: 60,
  semiannual: 90,
  nine_months: 90,
  yearly: 120,
  biennial: 180,
  triennial: 240,
};

export function getForgottenSubscriptions(subscriptions) {
  const now = new Date();

  return subscriptions
    .map((s) => {
      const payments = [
        ...(s.history || []),
        s.datePaid,
      ].filter(Boolean);

      if (payments.length === 0) return null;

      const lastPaid = payments
        .map((d) => new Date(d))
        .filter((d) => !isNaN(d))
        .sort((a, b) => b - a)[0];

      const nextExpected = computeNextRenewal(lastPaid, s.frequency);
      if (!nextExpected) return null;

      const grace =
        GRACE_BY_FREQUENCY[s.frequency] ?? 60;

      const diffDays = Math.ceil(
        (now - nextExpected) / 86400000
      );

      if (diffDays > grace) {
        return {
          ...s,
          lastPaid,
          overdueDays: diffDays,
        };
      }

      return null;
    })
    .filter(Boolean);
}
