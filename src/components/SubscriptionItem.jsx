// src/components/SubscriptionItem.jsx

import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SwipeToDeleteWrapper from "./ui/SwipeToDeleteWrapper";
import CategoryChip, { CATEGORY_COLORS } from "./CategoryChip";
import ProgressBar from "./ui/ProgressBar";
import HealthBadge from "./HealthBadge";
import PriceAlertBadge from "./PriceAlertBadge";

import { computeNextRenewal } from "../utils/renewal";
import { subscriptionHealth } from "../utils/subscriptionHealth";
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
  onMarkPaid,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const dateInputRef = useRef(null);

  const payments = Array.isArray(item.payments) ? item.payments : [];

  /* ---------------- Last payment ---------------- */
  const lastPaymentDate = useMemo(() => {
    if (!payments.length) return null;
    return new Date(
      Math.max(...payments.map((p) => new Date(p.date)))
    );
  }, [payments]);

  /* ---------------- Next renewal (FIXED) ---------------- */
  const nextRenewal = useMemo(() => {
    if (!payments.length) return null;
    return computeNextRenewal(payments, item.frequency);
  }, [payments, item.frequency]);

  /* ---------------- Days left (DO NOT CLAMP) ---------------- */
  const daysLeft = useMemo(() => {
    if (!nextRenewal) return null;
    return diffInDays(nextRenewal, new Date());
  }, [nextRenewal]);

  /* ---------------- Display price ---------------- */
  const displayPrice = useMemo(() => {
    if (!rates || !convert || !item.price || !item.currency) return item.price;
    return convert(item.price, item.currency, currency, rates);
  }, [item.price, item.currency, currency, rates, convert]);

  /* ---------------- Progress calculation (FIXED) ---------------- */
  const progress = useMemo(() => {
    if (!lastPaymentDate || !nextRenewal) return 0;

    const totalMs = nextRenewal.getTime() - lastPaymentDate.getTime();
    const elapsedMs = Date.now() - lastPaymentDate.getTime();

    if (totalMs <= 0) return 0;
    if (elapsedMs <= 0) return 0;

    return Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  }, [lastPaymentDate, nextRenewal]);

  /* ---------------- UI helpers ---------------- */
  const categoryKey = (item.category || "other").toLowerCase();
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const nextPaymentText = useMemo(() => {
    if (!nextRenewal) return t("no_paid_date");
    if (daysLeft > 1) return t("payment_in_days", { d: daysLeft });
    if (daysLeft === 1) return t("payment_in_1_day");
    if (daysLeft === 0) return t("due_today");
    if (daysLeft === -1) return t("overdue_1_day");
    return t("overdue_days", { d: Math.abs(daysLeft) });
  }, [nextRenewal, daysLeft, t]);

  const recentPayments = payments
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const openCalendar = () => {
    const input = dateInputRef.current;
    input?.showPicker?.();
    input?.click?.();
  };

  return (
    <SwipeToDeleteWrapper onDelete={() => onDelete(item.id)} deleteLabel={t("delete")}>
      <div className="p-5 rounded-3xl bg-white/90 dark:bg-black/35 border dark:border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div>
            <HealthBadge {...subscriptionHealth(item)} />
            <div className="text-lg font-semibold mt-1">{item.name}</div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              {currency} {displayPrice?.toFixed(2)} / {t(`frequency_${item.frequency}`)}
            </div>

            {lastPaymentDate && (
              <div className="mt-0 text-xs text-gray-500">
                {t("label_last_paid")}: {lastPaymentDate.toLocaleDateString()}
              </div>
            )}

            {recentPayments.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                {t("previous_payments")}:{" "}
                {recentPayments.map((p) =>
                  new Date(p.date).toLocaleDateString()
                ).join(", ")}
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
          <button
            onClick={openCalendar}
            title={nextPaymentText}
            className="px-4 py-1.5 capitalize rounded-xl text-xs bg-green-300 text-black"
          >
            {t("paid")}
          </button>

          <ProgressBar
            progress={progress}
            color={color}
            daysLeft={daysLeft}
          />

          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="px-4 py-1.5 capitalize rounded-xl text-xs bg-blue-500 text-white"
          >
            {t("edit")}
          </button>
        </div>

        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          onChange={(e) => onMarkPaid(item.id, e.target.value)}
        />
      </div>
    </SwipeToDeleteWrapper>
  );
}
