// src/components/CurrencySelector.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";

/** -------------------------------------------------------------------
 * Central supported currency list (unchanged)
 * ------------------------------------------------------------------- */
const supportedCurrencies = [
  "EUR", "USD", "GBP", "CHF", "PLN", "SEK", "DKK", "NOK", "JPY",
  "CAD", "AUD", "NZD", "CZK", "HUF", "RON", "BGN", "RSD", "HRK",
  "BAM", "TRY", "CNY", "HKD", "SGD", "ZAR", "MXN", "BRL", "INR",
  "KRW", "TWD", "THB", "PHP", "IDR", "MYR", "ILS", "AED"
];

/** -------------------------------------------------------------------
 * CurrencySelector
 * ------------------------------------------------------------------- */
export default function CurrencySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = value || "EUR";

  /** ---------------------------------------------------------------
   * Close dropdown when clicking outside
   * --------------------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** ---------------------------------------------------------------
   * Close dropdown on Escape key
   * --------------------------------------------------------------- */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  /** ---------------------------------------------------------------
   * Efficient onChange handler (stable reference)
   * --------------------------------------------------------------- */
  const selectCurrency = useCallback(
    (currency) => {
      onChange(currency);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* BUTTON – unchanged styling */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex flex-start gap-6 text-sm py-1 px-2 rounded-md
          border border-gray-300 dark:border-gray-700
          hover:bg-gray-100 dark:hover:bg-gray-800
        "
      >
        <span>{selected}</span>

        {/* Arrow with rotation animation */}
        <span
          className={`form-arrow flex self-end transition-transform ${open ? "rotate-180" : "rotate-0"
            }`}
        >
          ▾
        </span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            max-h-64 overflow-y-auto custom-scrollbar
          "
        >
          {supportedCurrencies.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => selectCurrency(code)}
              className={`
                w-full px-4 py-3 text-left text-sm transition
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${selected === code ? "bg-gray-50 dark:bg-gray-800" : ""}
              `}
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
