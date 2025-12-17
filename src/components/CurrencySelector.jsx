import React, { useState, useRef, useEffect, useCallback } from "react";

const supportedCurrencies = [
  "EUR", "USD", "GBP", "CHF", "PLN", "SEK", "DKK", "NOK", "JPY",
  "CAD", "AUD", "NZD", "CZK", "HUF", "RON", "BGN", "RSD", "HRK",
  "BAM", "TRY", "CNY", "HKD", "SGD", "ZAR", "MXN", "BRL", "INR",
  "KRW", "TWD", "THB", "PHP", "IDR", "MYR", "ILS", "AED"
];

function getFlagEmoji(code) {
  const map = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿",
    CNY: "🇨🇳", INR: "🇮🇳", BRL: "🇧🇷", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", CHF: "🇨🇭",
    PLN: "🇵🇱", HUF: "🇭🇺", CZK: "🇨🇿", RON: "🇷🇴", BGN: "🇧🇬", SGD: "🇸🇬", MXN: "🇲🇽",
    ZAR: "🇿🇦", KRW: "🇰🇷", THB: "🇹🇭", TWD: "🇹🇼", PHP: "🇵🇭", IDR: "🇮🇩", MYR: "🇲🇾",
    ILS: "🇮🇱", AED: "🇦🇪", TRY: "🇹🇷", HKD: "🇭🇰", RSD: "🇷🇸", HRK: "🇭🇷", BAM: "🇧🇦"
  };
  return map[code] || "🏳️";
}

export default function CurrencySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = value || "EUR";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const selectCurrency = useCallback(
    (currency) => {
      onChange(currency);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex gap-1 items-center px-3 py-2 justify-center
        rounded-2xl
        bg-white/20 dark:bg-black/20
        backdrop-blur-xl
        border border-white/30 dark:border-white/10
        shadow-[0_8px_20px_rgba(0,0,0,0.25)]
        transition-all active:scale-95"
      >
        <span>{getFlagEmoji(selected)}</span>
        <span>{selected}</span>
        <span className={`form-arrow transition-transform ${open ? "rotate-180" : "rotate-0"}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white dark:bg-gray-900 border rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {supportedCurrencies.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => selectCurrency(code)}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${selected === code ? "bg-gray-50 dark:bg-gray-800" : ""
                }`}
            >
              <span className="mr-2">{getFlagEmoji(code)}</span> {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
