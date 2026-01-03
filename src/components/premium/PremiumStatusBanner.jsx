import { usePremium } from "../../hooks/usePremium";
import { Trans } from "react-i18next";

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
        <Trans
          i18nKey="premium.expires_notice"
          values={{ date: formatDate(premiumEndsAt) }}
          components={{ strong: <strong /> }}
        />
      </div>
    );
  }

  // PAST DUE (PAYMENT FAILED)
  if (status === "past_due") {
    return (
      <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3">
        {t("payment.failed_notice")}
      </div>
    );
  }

  // EXPIRED
  if (!isPremium && status === "canceled") {
    return (
      <div className="bg-gray-100 text-gray-600 text-xs p-2 rounded mb-3">
        {t("premium.expired_notice")}
      </div>
    );
  }

  return null;
}
