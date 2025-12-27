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
import { getCategoryStyles } from "../utils/CategoryStyles";
import { useReadableText } from "../hooks/useReadableText";
import { isLightSurface } from "../utils/isLightSurface";
import { useTheme } from "../hooks/useTheme";

// ---------- UTILITIES ----------
function diffInDays(dateA, dateB) {
  return Math.ceil((dateA - dateB) / 86400000);
}

function toRgba(color, alpha) {
  if (!color) return `rgba(255,255,255,${alpha})`;

  if (color.startsWith("rgba")) {
    return color.replace(/rgba\(([^)]+),[^)]+\)/, `rgba($1, ${alpha})`);
  }

  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
}

// ---------- COMPONENT ----------
export default function SubscriptionItem({
  item,
  currency,
  rates,
  convert,
  onDelete,
  onMarkPaid
}) {
  console.log("SubscriptionItem render");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const dateInputRef = useRef(null);

  const payments = Array.isArray(item.payments) ? item.payments : [];
  const categoryKey = (item.category || "other").toLowerCase();
  const progressColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const baseColor = item.color || "rgba(255,255,255,0.9)";

  const categoryStyle = getCategoryStyles(item.category);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const hasCustomColor = Boolean(item.color);
  const isLightCard = hasCustomColor && isLightSurface(item.color);

  const baseIntensity =
    typeof item.gradientIntensity === "number"
      ? item.gradientIntensity
      : 0.25;

  // 🌙 Reduce intensity in dark mode
  const intensity = isDarkMode
    ? Math.max(0.12, baseIntensity * 0.6)
    : baseIntensity;

  /* 🔹 ADD: low-power detection */
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
      navigator.connection?.saveData === true);

  const gradientStyle =
    premium.isPremium && !prefersReducedMotion
      ? {
        background: `linear-gradient(
            200deg,
            ${toRgba(baseColor, intensity + 0.15)},
            ${toRgba(baseColor, intensity)},
            transparent
          )`,
        backgroundSize: "200% 200%",
        animation: "trakioGradient 6s ease infinite",
      }
      : {
        background: `linear-gradient(
            135deg,
            ${toRgba(baseColor, intensity)},
            transparent
          )`,
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

  const openCalendar = () => {
    const input = dateInputRef.current;
    input?.showPicker?.();
    input?.click?.();
  };

  return (
    <SwipeToDeleteWrapper
      onDelete={() => onDelete(item.id)}
      deleteLabel={t("button_delete")}
    >
      {({ isSwiping }) => {
        const readableText = useReadableText({
          isDarkMode,
          isSwiping,
          isLightCard,
        });


        return (
          <div className={`
  relative overflow-hidden rounded-3xl border shadow-lg
  dark:border-white/10
  ${isDarkMode && isLightCard ? "saturate-90" : ""}
`}
          >
            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 ${premium.isPremium ? "transition-all duration-500" : ""
                }`}
              style={gradientStyle}
            />

            <div className="relative z-10 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-row">
                  <div className="flex flex-col justify-center items-center">
                    <HealthBadge {...subscriptionHealth(item)} />
                    <div className="p-2">
                      {item.icon ? (
                        <img
                          src={`/icons/${item.icon}.svg`}
                          alt={item.name}
                          className="w-8 h-8"
                        />
                      ) : (
                        <span className="text-xl" title={item.category}>
                          {categoryStyle.icon}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col ml-2">
                      <div
                        className={`text-lg text-black dark:text-gray-300 font-tight tracking-tight drop-shadow-sm font-semibold`}
                      >
                        {item.name}
                      </div>

                      <div
                        className={`text-xs text-black dark:text-gray-300 font-medium tabular-nums`}
                      >
                        {currency} {displayPrice?.toFixed(2)} /{" "}
                        {t(`frequency_${item.frequency}`)}
                      </div>
                      <div className={`text-xs text-black dark:text-gray-300 tabular-nums`}
                      >
                        {nextPaymentText}
                      </div>
                    </div>
                  </div>
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
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0]; // ✅ define 'today'
                    openCalendar();
                    // onMarkPaid(item.id, today); // ✅ now this works
                  }} title={nextPaymentText}
                  className="px-4 py-1.5 rounded-xl text-xs bg-green-300 text-black"
                >
                  {t("paid")}
                </button>

                <ProgressBar
                  progress={progress}
                  color={progressColor}
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
          </div>
        );
      }}
    </SwipeToDeleteWrapper>

  );
}
