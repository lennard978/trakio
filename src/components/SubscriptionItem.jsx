import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { getCategoryStyle } from "../utils/CategoryStyles";

export default function SubscriptionItem({
  item,
  onDelete,
  currency,
  rates,
  convert,
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // SAFE DATE
  const validPaidDate =
    item.datePaid && !isNaN(new Date(item.datePaid).getTime())
      ? new Date(item.datePaid)
      : null;

  const [paidDate, setPaidDate] = useState(validPaidDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // CATEGORY STYLING
  const categoryKey =
    item.category?.toLowerCase().replace(/\s+/g, "_") || "other";
  const cat = getCategoryStyle(categoryKey);

  // SWIPE SETUP
  const maxSwipe = 144;
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const [animX, setAnimX] = useState(0);

  const animRef = useRef(null);
  const lastDxRef = useRef(0);

  const smoothTo = (target, speed = 0.2) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const animate = () => {
      setAnimX((prev) => {
        const diff = target - prev;
        const next = prev + diff * speed;
        if (Math.abs(diff) < 0.5) return target;
        animRef.current = requestAnimationFrame(animate);
        return next;
      });
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setTouchStartX(t.clientX);
    setTouchStartY(t.clientY);
    lastDxRef.current = animX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX == null || touchStartY == null) return;

    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dy) > 10) return;

    let newX = isSwipedOpen ? -maxSwipe + dx : dx;
    newX = Math.max(newX, -maxSwipe);
    newX = newX > 0 ? newX * 0.3 : newX;

    lastDxRef.current = newX;
    setAnimX(newX);
  };

  const handleTouchEnd = () => {
    const final = lastDxRef.current;

    if (final < -maxSwipe * 0.4) {
      setIsSwipedOpen(true);
      smoothTo(-maxSwipe);
    } else {
      setIsSwipedOpen(false);
      smoothTo(0);
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  const closeSwipe = () => {
    smoothTo(0);
    setIsSwipedOpen(false);
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (isNaN(selectedDate.getTime())) return;

    setPaidDate(selectedDate);

    const saved = JSON.parse(localStorage.getItem("subscriptions")) || [];
    const updated = saved.map((s) =>
      s.id === item.id ? { ...s, datePaid: selectedDate.toISOString() } : s
    );
    localStorage.setItem("subscriptions", JSON.stringify(updated));

    showToast(
      t("toast_paid_set", { date: selectedDate.toLocaleDateString() }),
      "success"
    );

    setShowDatePicker(false);
  };

  // FREQUENCY MAP
  const freqMap = {
    weekly: { days: 7 },
    biweekly: { days: 14 },
    monthly: { months: 1 },
    quarterly: { months: 3 },
    semiannual: { months: 6 },
    nine_months: { months: 9 },
    yearly: { months: 12 },
    biennial: { months: 24 },
    triennial: { months: 36 },
  };

  const today = new Date();
  const renewalDate = paidDate ? new Date(paidDate) : null;

  if (renewalDate) {
    const cfg = freqMap[item.frequency] || { months: 1 };
    if (cfg.months) renewalDate.setMonth(renewalDate.getMonth() + cfg.months);
    if (cfg.days) renewalDate.setDate(renewalDate.getDate() + cfg.days);
  }

  const totalCycle =
    paidDate && renewalDate
      ? Math.round((renewalDate - paidDate) / 86400000)
      : 0;

  const daysPassed = paidDate
    ? Math.round((today - paidDate) / 86400000)
    : 0;

  const daysLeft = totalCycle - daysPassed;

  const progress =
    totalCycle > 0 ? Math.min(100, Math.round((daysPassed / totalCycle) * 100)) : 0;

  // PROGRESS CIRCLE
  const circumference = 2 * Math.PI * 16;
  const offset = circumference * (1 - progress / 100);

  // PRICE DISPLAY
  const preferredCurrency = currency || item.currency || "EUR";
  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", preferredCurrency, rates)
      : item.price;

  return (
    <div className="relative w-full" style={{ touchAction: "pan-y" }}>
      {/* SWIPE BUTTONS */}
      <div className="absolute inset-y-0 right-0 flex items-stretch pr-2">
        <button
          onClick={() => navigate(`/edit/${item.id}`)}
          className="min-w-[3.5rem] bg-gray-500 text-white flex flex-col items-center justify-center text-[11px] rounded-l-xl"
        >
          <FaEdit className="mb-0.5" />
          {t("button_edit")}
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="min-w-[4rem] bg-red-600 text-white flex flex-col items-center justify-center text-[11px] rounded-r-xl"
        >
          <FaTrash className="mb-0.5" />
          {t("button_delete")}
        </button>
      </div>

      {/* CARD */}
      <div
        className={`relative p-4 rounded-2xl border backdrop-blur-md shadow transition-all 
        bg-white/70 dark:bg-slate-900/80 
        border-white/40 dark:border-slate-700`}
        style={{ transform: `translateX(${animX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isSwipedOpen ? closeSwipe : undefined}
      >
        <div className="flex justify-between items-start gap-3">

          {/* LEFT SIDE */}
          <div className="flex flex-col min-w-0">
            <div className="font-semibold text-base truncate flex items-center gap-1">
              <span>{cat.icon}</span>
              {item.name}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {`${preferredCurrency} ${displayPrice.toFixed(2)} / ${t(
                `frequency_${item.frequency}`
              )}`}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {paidDate
                ? daysLeft < 0
                  ? t("label_overdue", { days: Math.abs(daysLeft) })
                  : t("label_renews_in", { days: daysLeft })
                : ""}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-end gap-2">

            {/* CATEGORY BADGE */}
            <span
              className={`px-2 py-1 text-[10px] rounded-full ${cat.bgBadge}`}
            >
              {t(cat.label)}
            </span>

            {/* PROGRESS CIRCLE */}
            {paidDate && (
              <div className="relative flex items-center justify-center">
                <svg width="40" height="40" className="-rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    strokeWidth="4"
                    className="text-gray-300 dark:text-gray-700"
                    fill="transparent"
                  />

                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    strokeWidth="4"
                    fill="transparent"
                    stroke={cat.ring}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px]">{progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* LAST PAID */}
        {paidDate && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("label_last_paid", {
              date: paidDate.toLocaleDateString(),
            })}
          </div>
        )}

        {/* SET PAID DATE */}
        <button
          onClick={() => setShowDatePicker(true)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md text-xs mt-2"
        >
          <FaCheckCircle className="text-[10px]" />
          {t("button_paid")}
        </button>

        {showDatePicker && (
          <div className="mt-2">
            <input
              type="date"
              className="px-3 py-2 rounded-md border dark:bg-gray-700 dark:text-white"
              defaultValue={new Date().toISOString().split("T")[0]}
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
