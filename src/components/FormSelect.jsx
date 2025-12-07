import React, { useState, useRef, useEffect } from "react";

const supportedCurrencies = [
  "EUR", "USD", "GBP", "CHF", "PLN",
  "SEK", "DKK", "NOK", "JPY", "CAD", "AUD"
];

export default function CurrencySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* TOP SELECT BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="form-box"
      >
        <span className="text-gray-100">{value}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
            bg-white dark:bg-gray-900 border border-gray-700
            max-h-64 overflow-y-auto scrollbar-none
          "
        >
          {supportedCurrencies.map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => {
                onChange(cur);
                setOpen(false);
              }}
              className="
                w-full flex items-center px-4 py-3 text-left
                hover:bg-gray-100 dark:hover:bg-gray-800 transition
              "
            >
              <span className="text-gray-900 dark:text-gray-100">{cur}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
