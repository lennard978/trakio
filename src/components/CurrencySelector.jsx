// src/components/CurrencySelector.jsx
import React, { useState, useRef, useEffect } from "react";

const supportedCurrencies = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "PLN",
  "SEK",
  "DKK",
  "NOK",
  "JPY",
  "CAD",
  "AUD",

  // Added currencies
  "NZD", // New Zealand Dollar
  "CZK", // Czech Koruna
  "HUF", // Hungarian Forint
  "RON", // Romanian Leu
  "BGN", // Bulgarian Lev
  "RSD", // Serbian Dinar
  "HRK", // Croatian Kuna (legacy, replaced by EUR but still used historically)
  "BAM", // Bosnian Convertible Mark
  "TRY", // Turkish Lira
  "CNY", // Chinese Yuan
  "HKD", // Hong Kong Dollar
  "SGD", // Singapore Dollar
  "ZAR", // South African Rand
  "MXN", // Mexican Peso
  "BRL", // Brazilian Real
  "INR", // Indian Rupee
  "KRW", // South Korean Won
  "TWD", // New Taiwan Dollar
  "THB", // Thai Baht
  "PHP", // Philippine Peso
  "IDR", // Indonesian Rupiah
  "MYR", // Malaysian Ringgit
  "ILS", // Israeli Shekel
  "AED"  // UAE Dirham
];


export default function CurrencySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = value || "EUR";

  return (
    <div className="relative" ref={ref}>
      {/* BUTTON CHANGE */}
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="flex flex-start gap-6 text-sm py-1 px-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span>{selected}</span>
        <span className="form-arrow flex self-end">▾</span>
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
          {supportedCurrencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="
                w-full px-4 py-3 text-left text-sm
                hover:bg-gray-100 dark:hover:bg-gray-800 transition
              "
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
