// src/components/SubscriptionItem.jsx

import React, { useRef, useMemo, useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { loadSubscriptionsLocal } from "../utils/mainDB";

/* ---------- utilities ---------- */
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

/* ---------- component ---------- */
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
  const { id } = useParams();

  const dateInputRef = useRef(null);

  // 🔒 LOCAL ACTION LOCK
  const [busy, setBusy] = useState(false);

  const payments = Array.isArray(item.payments) ? item.payments : [];
  const categoryKey = (item.category || "other").toLowerCase();
  const progressColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const baseColor = item.color || "rgba(255,255,255,0.9)";
  const hasCustomColor = Boolean(item.color);
  const isLightCard = hasCustomColor && isLightSurface(item.color);

  const baseIntensity =
    typeof item.gradientIntensity === "number"
      ? item.gradientIntensity
      : 0.25;

  const intensity = isDarkMode
    ? Math.max(0.12, baseIntensity * 0.6)
    : baseIntensity;

  const gradientStyle = {
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

  /* ---------- handlers ---------- */
  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete(item.id); // ✅ await parent persist
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async (date) => {
    if (busy || !date) return;
    setBusy(true);
    try {
      await onMarkPaid(item.id, date);
    } finally {
      setBusy(false);
    }
  };

  const openCalendar = () => {
    if (busy) return;
    const input = dateInputRef.current;
    input?.showPicker?.();
    input?.click?.();
  };

  useEffect(() => {
    (async () => {
      const subs = await loadSubscriptionsLocal();
      const found = subs.find((s) => s.id === id);

      if (!found) {
        navigate("/dashboard");
        return;
      }

      setForm({
        name: found.name ?? "",
        price: found.price ?? "",
        frequency: found.frequency ?? "monthly",
        category: found.category ?? "Other",
        paymentMethod: found.method ?? "",
        color: found.color ?? null,
        payments: found.payments ?? [],
      });
    })();
  }, [id]);

  return (
    <SwipeToDeleteWrapper
      onDelete={handleDelete}
      deleteLabel={t("button_delete")}
    >
      {({ isSwiping }) => {
        const readableText = useReadableText({
          isDarkMode,
          isSwiping,
          isLightCard,
        });

        return (
          <div className="relative overflow-hidden rounded-3xl border shadow-lg dark:border-white/10">
            <div
              className={`absolute inset-0 ${premium.isPremium ? "transition-all duration-500" : ""
                }`}
              style={gradientStyle}
            />

            <div className="relative z-10 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-1">
                <div className="flex">
                  <div className="flex flex-col items-center">
                    <HealthBadge {...subscriptionHealth(item)} />
                    <div className="p-2">
                      {item.icon ? (
                        <img src={`/icons/${item.icon}.svg`} alt="" className="w-8 h-8" />
                      ) : (
                        <span className="text-xl">
                          {getCategoryStyles(item.category).icon}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-2">
                    <div className="text-lg font-semibold text-black dark:text-gray-300">
                      {item.name}
                    </div>
                    <div className="text-xs tabular-nums">
                      {currency} {displayPrice?.toFixed(2)} /{" "}
                      {t(`frequency_${item.frequency}`)}
                    </div>
                    <div className="text-xs tabular-nums">
                      {nextPaymentText}
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
                  onClick={openCalendar}
                  disabled={busy}
                  className="px-4 py-1.5 rounded-xl text-xs bg-green-300 text-black disabled:opacity-50"
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
        );
      }}
    </SwipeToDeleteWrapper>
  );
}
