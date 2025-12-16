import { computeNextRenewal } from "./renewal";

export function getSubscriptionHealth(subscription) {
  const payments = [
    ...(subscription.history || []),
    subscription.datePaid,
  ].filter(Boolean);

  const validPayments = payments
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  if (validPayments.length === 0) {
    return {
      status: "never_paid",
      label: "Never paid",
      color: "gray",
    };
  }

  const lastPaid = validPayments.sort((a, b) => b - a)[0];
  const next = computeNextRenewal(lastPaid, subscription.frequency);

  if (!next) {
    return {
      status: "inactive",
      label: "Inactive",
      color: "red",
    };
  }

  const now = new Date();
  const diffDays = Math.ceil((now - next) / 86400000);

  if (diffDays <= 0) {
    return {
      status: "active",
      label: "Active",
      color: "green",
    };
  }

  if (diffDays <= 30) {
    return {
      status: "at_risk",
      label: "At risk",
      color: "yellow",
    };
  }

  return {
    status: "inactive",
    label: "Inactive",
    color: "red",
  };
}
