// src/utils/subscriptionHealth.js
import { computeNextRenewal } from "./renewal";
import i18n from "../i18n"; // Make sure this is the initialized i18n instance

export function subscriptionHealth(subscription) {
  const payments = Array.isArray(subscription.payments)
    ? subscription.payments
    : [];

  if (payments.length === 0) {
    return {
      status: "never_paid",
      label: i18n.t("subscriptions.status.never_paid"),
      color: "gray",
    };
  }

  const lastPaid = new Date(
    Math.max(...payments.map((p) => new Date(p.date)))
  );

  if (isNaN(lastPaid.getTime())) {
    return {
      status: "never_paid",
      label: i18n.t("subscriptions.status.never_paid"),
      color: "gray",
    };
  }

  const next = computeNextRenewal(payments, subscription.frequency);

  if (!next) {
    return {
      status: "inactive",
      label: i18n.t("subscriptions.status.inactive"),
      color: "red",
    };
  }

  const now = new Date();
  const diffDays = Math.ceil((next - now) / 86400000);

  if (diffDays >= 0) {
    return {
      status: "active",
      label: i18n.t("subscriptions.status.active"),
      color: "green",
    };
  }

  if (diffDays >= -30) {
    return {
      status: "at_risk",
      label: i18n.t("subscriptions.status.at_risk"),
      color: "yellow",
    };
  }

  return {
    status: "inactive",
    label: i18n.t("subscriptions.status.inactive"),
    color: "red",
  };
}
