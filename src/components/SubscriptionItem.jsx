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

// ---------- UTILITIES ----------
function diffInDays(dateA, dateB) {
  return Math.ceil((dateA - dateB) / 86400000);
}

function rgbToHex(rgba) {
  const m = rgba.match(/\d+/g);
  if (!m || m.length < 3) return "#ffffff";
  return (
    "#" +
    m.slice(0, 3).map((x) => Number(x).toString(16).padStart(2, "0")).join("")
  );
}

function isDarkColor(bg) {
  if (!bg) return false;
  const hex = bg.startsWith("#") ? bg : rgbToHex(bg);
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 150;
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
  onMarkPaid,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const premium = usePremium();
  const dateInputRef = useRef(null);

  const payments = Array.isArray(item.payments) ? item.payments : [];
  const categoryKey = (item.category || "other").toLowerCase();
  const progressColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const baseColor = item.color || "rgba(255,255,255,0.9)";
  const isDarkBg = isDarkColor(baseColor);

  const textColor = isDarkBg ? "text-white" : "text-gray-800";
  const subTextColor = isDarkBg ? "text-gray-200" : "text-gray-600";
  const labelColor = isDarkBg ? "text-gray-300" : "text-gray-500";

  const readableText = getReadableTextStyles(baseColor);

  const intensity =
    typeof item.gradientIntensity === "number" ? item.gradientIntensity : 0.25;

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

  // 🔹 ADD: normalize text contrast against translucent gradients
  function getReadableTextStyles(bgColor) {
    if (!bgColor) {
      return {
        text: "text-gray-800",
        subText: "text-gray-600",
        label: "text-gray-500",
        shadow: "",
      };
    }

    const dark = isDarkColor(bgColor);

    // Detect very transparent backgrounds (common with rgba gradients)
    const alphaMatch = bgColor.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
    const alpha = alphaMatch ? Number(alphaMatch[1]) : 1;

    const needsBoost = alpha < 0.35;

    return {
      text: dark || needsBoost ? "text-white" : "text-gray-800",
      subText: dark || needsBoost ? "text-gray-200" : "text-gray-600",
      label: dark || needsBoost ? "text-gray-300" : "text-gray-500",
      shadow: needsBoost
        ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
        : "",
    };
  }


  return (
    <SwipeToDeleteWrapper onDelete={() => onDelete(item.id)} deleteLabel={t("delete")}>
      <div className="relative overflow-hidden rounded-3xl border dark:border-white/10 shadow-lg">
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 ${premium.isPremium ? "transition-all duration-500" : ""
            }`}
          style={gradientStyle}
        />

        <div className="relative z-10 p-5 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-3 gap-3">
            <div>
              <HealthBadge {...subscriptionHealth(item)} />
              <div className={`text-lg font-semibold mt-1 ${readableText.text} ${readableText.shadow}`}
              >                {item.name}
              </div>
              <div
                className={`text-sm ${readableText.subText} ${readableText.shadow}`}
              >                {currency} {displayPrice?.toFixed(2)} /{" "}
                {t(`frequency_${item.frequency}`)}
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
              title={nextPaymentText}
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
              className="px-4 py-1.5 rounded-xl text-xs bg-blue-500 text-white"
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

      {/* Premium gradient animation */}
      {premium.isPremium && (
        <style>{`
          @keyframes trakioGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </SwipeToDeleteWrapper>
  );
}
