import React, { useRef, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SwipeToDeleteWrapper from "./ui/SwipeToDeleteWrapper";
import CategoryChip from "./CategoryChip";
import { CATEGORY_COLORS } from "../constants/categoryColors.js";
import ProgressBar from "./ui/ProgressBar";
import HealthBadge from "./HealthBadge";
import PriceAlertBadge from "./PriceAlertBadge";
import { computeNextRenewal } from "../utils/renewal";
import { subscriptionHealth } from "../utils/subscriptionHealth";
import { usePremium } from "../hooks/usePremium";
import { getCategoryStyles } from "../utils/CategoryStyles";
import { useTheme } from "../hooks/useTheme";

// ✅ NEW: default fallback icon
import DefaultSubscriptionIcon from "./icons/DefaultSubscriptionIcon";

function diffInDays(dateA, dateB) {
  return Math.ceil((dateA - dateB) / 86400000);
}

function toRgba(color, alpha = 1) {
  if (!color) return `rgba(255,255,255,${alpha})`;
  if (color.startsWith("rgba"))
    return color.replace(/rgba\(([^)]+),[^)]+\)/, `rgba($1, ${alpha})`);
  if (color.startsWith("#")) {
    const [r, g, b] = color
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const dateInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const payments = Array.isArray(item.payments) ? item.payments : [];
  const categoryKey = (item.category || "other").toLowerCase();
  const progressColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const baseColor = item.color || "rgba(255,255,255,0.9)";

  const baseIntensity =
    typeof item.gradientIntensity === "number" ? item.gradientIntensity : 0.25;
  const intensity = isDarkMode
    ? Math.max(0.12, baseIntensity * 0.6)
    : baseIntensity;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${toRgba(
      baseColor,
      intensity
    )}, transparent)`,
  };

  const lastPaymentDate = useMemo(() => {
    if (!payments.length) return null;
    return new Date(Math.max(...payments.map((p) => new Date(p.date))));
  }, [payments]);

  const nextRenewal = useMemo(() => {
    if (!payments.length) return null;
    return computeNextRenewal(payments, item.frequency);
  }, [payments, item.frequency]);

  const daysLeft = useMemo(() => {
    if (!nextRenewal) return null;
    return diffInDays(nextRenewal, new Date());
  }, [nextRenewal]);

  const displayPrice = useMemo(() => {
    if (!rates || !convert || !item.price || !item.currency) return item.price;
    return convert(item.price, item.currency, currency, rates);
  }, [item.price, item.currency, currency, rates, convert]);

  const progress = useMemo(() => {
    if (!lastPaymentDate || !nextRenewal) return 0;
    const totalMs = nextRenewal - lastPaymentDate;
    const elapsedMs = Date.now() - lastPaymentDate;
    if (totalMs <= 0 || elapsedMs <= 0) return 0;
    return Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  }, [lastPaymentDate, nextRenewal]);

  const nextPaymentText = useMemo(() => {
    if (!nextRenewal) return t("no_paid_date");
    if (daysLeft > 1) return t("payment_in_days", { d: daysLeft });
    if (daysLeft === 1) return t("payment_in_1_day");
    if (daysLeft === 0) return t("due_today");
    if (daysLeft === -1) return t("overdue_1_day");
    return t("overdue_days", { d: Math.abs(daysLeft) });
  }, [nextRenewal, daysLeft, t]);

  const handleDelete = useCallback(async () => {
    if (busy) return;

    const ok =
      typeof window !== "undefined"
        ? window.confirm(t("confirm_delete_sub") || "Delete this subscription?")
        : true;

    if (!ok) return;

    setBusy(true);
    try {
      await onDelete(item.id);
    } finally {
      setBusy(false);
    }
  }, [busy, onDelete, item.id, t]);

  const handleMarkPaid = useCallback(
    async (date) => {
      if (busy || !date) return;
      setBusy(true);
      try {
        await onMarkPaid(item.id, date);
      } finally {
        setBusy(false);
      }
    },
    [busy, onMarkPaid, item.id]
  );

  const openCalendar = useCallback(() => {
    if (busy) return;
    const input = dateInputRef.current;
    input?.showPicker?.();
    input?.click?.();
  }, [busy]);

  // ✅ Icon decision logic: item.icon -> category icon -> default icon
  const categoryMeta = getCategoryStyles(item.category);
  const categoryIcon = categoryMeta?.icon;

  return (
    <SwipeToDeleteWrapper
      onDelete={handleDelete}
      deleteLabel={t("button_delete")}
    >
      {() => (
        <div className="relative overflow-hidden rounded-2xl border shadow-lg dark:border-white/10">
          <div
            className={`absolute inset-0 ${premium.isPremium ? "transition-all duration-500" : ""
              }`}
            style={gradientStyle}
          />
          <div className="relative z-10 p-5 backdrop-blur-xl">
            <div className="flex mb-2">
              <div className="flex flex-grow">
                <div className="flex flex-col items-center">
                  <HealthBadge {...subscriptionHealth(item)} />
                  <div className="p-2">
                    {item.icon ? (
                      <img
                        src={`/icons/${item.icon}.svg`}
                        alt=""
                        className="w-8 h-8"
                        aria-hidden="true"
                      />
                    ) : categoryIcon ? (
                      <span className="text-xl" aria-hidden="true">
                        {categoryIcon}
                      </span>
                    ) : (
                      <DefaultSubscriptionIcon size={32} decorative />
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col justify-center">
                  <div className="text-lg font-semibold text-black dark:text-gray-300">
                    {item.name}
                  </div>
                  <div className="text-xs tabular-nums">
                    {currency} {(Number(displayPrice) || 0).toFixed(2)} /{" "}
                    {t(`frequency_${item.frequency}`)}
                  </div>
                  <div className="text-xs tabular-nums">{nextPaymentText}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <CategoryChip category={item.category} />
                {premium.isPremium && item.priceAlert && (
                  <PriceAlertBadge alert={item.priceAlert} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                data-no-swipe
                onClick={(e) => {
                  e.stopPropagation();
                  openCalendar();
                }}
                disabled={busy}
                className="px-4 py-1.5 rounded-xl text-xs bg-green-300 text-black disabled:opacity-50"
              >
                {t("paid")}
              </button>

              <div
                className="relative flex-1"
                data-no-swipe
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ProgressBar
                  progress={progress}
                  color={progressColor}
                  daysLeft={daysLeft}
                />
              </div>


              <button
                data-no-swipe
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit/${item.id}`);
                }}
                disabled={busy}
                className="px-4 py-1.5 capitalize rounded-xl text-xs bg-blue-500 text-white disabled:opacity-50"
              >
                {t("edit")}
              </button>
            </div>

            <input
              ref={dateInputRef}
              type="date"
              className="hidden"
              onChange={(e) => handleMarkPaid(e.target.value)}
            />
          </div>
        </div>
      )}
    </SwipeToDeleteWrapper>
  );
}

SubscriptionItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    currency: PropTypes.string,
    frequency: PropTypes.string,
    category: PropTypes.string,
    color: PropTypes.string,
    gradientIntensity: PropTypes.number,
    payments: PropTypes.array,
    icon: PropTypes.string,
    priceAlert: PropTypes.object,
  }).isRequired,
  currency: PropTypes.string.isRequired,
  rates: PropTypes.object,
  convert: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onMarkPaid: PropTypes.func.isRequired,
};
