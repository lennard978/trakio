import React from "react";
import { useTranslation } from "react-i18next";

// Pastel colors unified here → reusable everywhere
export const CATEGORY_COLORS = {
  fitness: "#bbf7d0",
  bills: "#c7d2fe",
  transport: "#fed7aa",
  streaming: "#e9d5ff",
  software: "#bfdbfe",
  productivity: "#fee2b3",
  gaming: "#fecaca",
  education: "#a5f3fc",
  food: "#d9f99d",
  other: "#e5e7eb",
};

export default function CategoryChip({ category }) {
  const { t } = useTranslation();

  const key = (category || "other").trim().toLowerCase();
  const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.other;

  return (
    <div
      className="
        px-3 py-1 text-xs font-semibold rounded-full
        text-gray-900 dark:text-black capitalize
        backdrop-blur-md border border-white/40
        shadow-md
      "
      style={{
        backgroundColor: color,
        boxShadow: `0 0 18px ${color}90`,
      }}
    >
      {t(`category.${key}`, key)} {/* fallback to key if missing */}
    </div>
  );
}
