// src/utils/subscriptionHealth.js
import { computeNextRenewal } from "./renewal";

export function subscriptionHealth(subscription) {
  const payments = Array.isArray(subscription.payments)
    ? subscription.payments
    : [];

  if (payments.length === 0) {
    return {
      status: "never_paid",
      label: "Never paid",
      color: "gray",
    };
  }

  const lastPaid = new Date(
    Math.max(...payments.map((p) => new Date(p.date)))
  );

  if (isNaN(lastPaid.getTime())) {
    return {
      status: "never_paid",
      label: "Never paid",
      color: "gray",
    };
  }

  const next = computeNextRenewal(payments, subscription.frequency);

  if (!next) {
    return {
      status: "inactive",
      label: "Inactive",
      color: "red",
    };
  }

  const now = new Date();
  const diffDays = Math.ceil((next - now) / 86400000);

  // ✅ Still active
  if (diffDays >= 0) {
    return {
      status: "active",
      label: "Active",
      color: "green",
    };
  }

  // ⚠️ Recently overdue (grace window)
  if (diffDays >= -30) {
    return {
      status: "at_risk",
      label: "At-risk",
      color: "yellow",
    };
  }

  // ❌ Long overdue
  return {
    status: "inactive",
    label: "Inactive",
    color: "red",
  };
}
