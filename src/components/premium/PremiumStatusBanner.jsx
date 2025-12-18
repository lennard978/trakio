import { usePremium } from "../../hooks/usePremium";

export default function PremiumStatusBanner() {
  const {
    isPremium,
    cancelAtPeriodEnd,
    premiumEndsAt,
    status,
  } = usePremium();

  if (!status) return null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : null;

  // CANCELED BUT STILL ACTIVE
  if (isPremium && cancelAtPeriodEnd) {
    return (
      <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded mb-3">
        Premium will expire on{" "}
        <strong>{formatDate(premiumEndsAt)}</strong>.
        You can resubscribe anytime.
      </div>
    );
  }

  // PAST DUE (PAYMENT FAILED)
  if (status === "past_due") {
    return (
      <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3">
        Payment failed. Please update your billing details to
        avoid losing premium access.
      </div>
    );
  }

  // EXPIRED
  if (!isPremium && status === "canceled") {
    return (
      <div className="bg-gray-100 text-gray-600 text-xs p-2 rounded mb-3">
        Premium has expired. Upgrade to regain access.
      </div>
    );
  }

  return null;
}
