// src/components/FrequencySelector.jsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { value: "weekly", labelKey: "frequency_weekly", premiumOnly: false },
  { value: "biweekly", labelKey: "frequency_biweekly", premiumOnly: false },
  { value: "monthly", labelKey: "frequency_monthly", premiumOnly: false },
  { value: "quarterly", labelKey: "frequency_quarterly", premiumOnly: true },
  { value: "semiannual", labelKey: "frequency_semiannual", premiumOnly: true },
  { value: "nine_months", labelKey: "frequency_nine_months", premiumOnly: true },
  { value: "yearly", labelKey: "frequency_yearly", premiumOnly: false },
  { value: "biennial", labelKey: "frequency_biennial", premiumOnly: true },
  { value: "triennial", labelKey: "frequency_triennial", premiumOnly: true },
];

export default function FrequencySelector({
  value,
  onChange,
  isPremium,
  onRequirePremium,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /** -----------------------------------------------------------
   * Precompute selected option & options list for performance
   * ----------------------------------------------------------- */
  const selectedOption = useMemo(() => {
    return OPTIONS.find((opt) => opt.value === value) || OPTIONS.find((o) => o.value === "monthly");
  }, [value]);

  const options = useMemo(() => OPTIONS, []);

  /** -----------------------------------------------------------
   * Close dropdown on outside click
   * ----------------------------------------------------------- */
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /** -----------------------------------------------------------
   * Handle selection
   * ----------------------------------------------------------- */
  const handleSelect = (opt) => {
    // Block premium-only options
    if (opt.premiumOnly && !isPremium) {
      onRequirePremium?.();
      return;
    }

    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="form-field cursor-pointer"
      >
        <span>{t(selectedOption.labelKey)}</span>
        <span className="form-arrow">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
            bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
            max-h-64 overflow-y-auto
          "
        >
          {options.map((opt) => {
            const locked = opt.premiumOnly && !isPremium;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`
                  w-full px-4 py-3 text-left text-sm flex items-center justify-between
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition
                  ${locked ? "opacity-70" : ""}
                `}
              >
                <span>{t(opt.labelKey)}</span>

                {opt.premiumOnly && !isPremium && (
                  <span
                    className="
      text-[10px] px-2 py-0.5 rounded-full
      bg-yellow-400/80 text-black font-semibold
    "
                  >
                    PRO
                  </span>
                )}

              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
