
// SubscriptionItem.jsx (updated)

import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SwipeToDeleteWrapper from "./ui/SwipeToDeleteWrapper";
import CategoryChip, { CATEGORY_COLORS } from "./CategoryChip";
import ProgressBar from "./ui/ProgressBar";
import HealthBadge from "./HealthBadge";
import PriceAlertBadge from "./PriceAlertBadge";

import { computeNextRenewal } from "../utils/renewal";
import { getSubscriptionHealth } from "../utils/subscriptionHealth";
import { usePremium } from "../hooks/usePremium";

function diffInDays(dateA, dateB) {
  return Math.ceil((dateA - dateB) / 86400000);
}

export default function SubscriptionItem({
  item,
  currency,
  rates,
  convert,
  onDelete,
  onUpdatePaidDate,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const dateInputRef = useRef(null);

  const health = useMemo(() => getSubscriptionHealth(item), [item]);

  const nextRenewal = computeNextRenewal(item.datePaid, item.frequency);
  const today = new Date();
  const daysLeft = nextRenewal
    ? Math.max(diffInDays(nextRenewal, today), 0)
    : null;

  const displayPrice = useMemo(() => {
    if (!rates || !convert || !item.price || !item.currency) return item.price;
    return convert(item.price, item.currency, currency, rates);
  }, [item.price, item.currency, currency, rates, convert]);

  const categoryKey = (item.category || "other").toLowerCase();
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const progress = useMemo(() => {
    if (!item.datePaid) return 0;
    const start = new Date(item.datePaid);
    const now = new Date();
    const end = computeNextRenewal(item.datePaid, item.frequency);
    if (!end) return 0;
    const total = end - start;
    const used = now - start;
    if (used <= 0) return 0;
    if (used >= total) return 100;
    return Math.round((used / total) * 100);
  }, [item.datePaid, item.frequency]);

  const nextPaymentText = useMemo(() => {
    if (!item.datePaid) return t("no_paid_date");
    const next = computeNextRenewal(item.datePaid, item.frequency);
    if (!next) return t("no_paid_date");
    const diff = diffInDays(next, new Date());
    if (diff > 1) return t("payment_in_days", { d: diff });
    if (diff === 1) return t("payment_in_1_day");
    if (diff === 0) return t("due_today");
    if (diff === -1) return t("overdue_1_day");
    return t("overdue_days", { d: Math.abs(diff) });
  }, [item.datePaid, item.frequency, t]);

  const openCalendar = () => {
    const input = dateInputRef.current;
    input?.showPicker?.();
    input?.click?.();
  };

  const recentPayments = useMemo(() => {
    if (!Array.isArray(item.history)) return [];
    return item.history
      .map((h) => (typeof h === "string" ? h : h?.date))
      .filter((d) => d && !isNaN(new Date(d).getTime()))
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 3);
  }, [item.history]);

  return (
    <SwipeToDeleteWrapper onDelete={() => onDelete(item.id)} deleteLabel={t("delete")}>
      <div className="p-5 rounded-3xl bg-white/90 dark:bg-black/35 border dark:border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div>
            <HealthBadge label={health.label} color={health.color} />
            <div className="text-lg font-semibold mt-1">{item.name}</div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              {currency} {displayPrice?.toFixed(2)} / {t(`frequency_${item.frequency}`)}
              <div className="text-xs text-gray-500">
                ({item.currency} {item.price?.toFixed(2)})
              </div>
            </div>

            {item.datePaid && (
              <div className="mt-0 text-xs text-gray-500">
                {t("label_last_paid")}: {new Date(item.datePaid).toLocaleDateString()}
              </div>
            )}

            {item.paymentMethod && (
              <div className="mt-1 text-xs text-gray-500">
                {t("payment_method")}: {item.paymentMethod}
              </div>
            )}

            {recentPayments.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                {t("previous_payments")}:{" "}
                {recentPayments.map((d) => new Date(d).toLocaleDateString()).join(", ")}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <CategoryChip category={item.category} />
            {premium.isPremium && item.priceAlert && (
              <PriceAlertBadge alert={item.priceAlert} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={openCalendar} title={nextPaymentText} className="px-4 py-1.5 capitalize rounded-xl text-xs bg-green-300 text-black">
            {t("paid")}
          </button>

          <ProgressBar
            progress={progress}
            color={color}
            datePaid={item.datePaid}
            daysLeft={daysLeft}
            frequency={item.frequency}
          />

          <button onClick={() => navigate(`/edit/${item.id}`)} className="px-4 py-1.5 capitalize rounded-xl text-xs bg-blue-500 text-white">
            {t("edit")}
          </button>
        </div>

        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={item.datePaid || ""}
          onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
        />
      </div>
    </SwipeToDeleteWrapper>
  );
}
