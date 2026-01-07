// src/components/ui/CurrencySelector.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";

/* ------------------------------------------------------------------ */
/* Supported currencies                                               */
/* ------------------------------------------------------------------ */

export const SUPPORTED_CURRENCIES = [
  "EUR", "USD", "GBP", "CHF", "PLN", "SEK", "DKK", "NOK", "JPY",
  "CAD", "AUD", "NZD", "CZK", "HUF", "RON", "BGN", "RSD", "HRK",
  "BAM", "TRY", "CNY", "HKD", "SGD", "ZAR", "MXN", "BRL", "INR",
  "KRW", "TWD", "THB", "PHP", "IDR", "MYR", "ILS", "AED",
];

const FLAG_MAP = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CNY: "🇨🇳",
  INR: "🇮🇳",
  BRL: "🇧🇷",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  CHF: "🇨🇭",
  PLN: "🇵🇱",
  HUF: "🇭🇺",
  CZK: "🇨🇿",
  RON: "🇷🇴",
  BGN: "🇧🇬",
  SGD: "🇸🇬",
  MXN: "🇲🇽",
  ZAR: "🇿🇦",
  KRW: "🇰🇷",
  THB: "🇹🇭",
  TWD: "🇹🇼",
  PHP: "🇵🇭",
  IDR: "🇮🇩",
  MYR: "🇲🇾",
  ILS: "🇮🇱",
  AED: "🇦🇪",
  TRY: "🇹🇷",
  HKD: "🇭🇰",
  RSD: "🇷🇸",
  HRK: "🇭🇷",
  BAM: "🇧🇦",
};

function getFlagEmoji(code) {
  return FLAG_MAP[code] || "🏳️";
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function CurrencySelector({
  value,
  onChange,
  onOpenChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = value && SUPPORTED_CURRENCIES.includes(value)
    ? value
    : "EUR";

  /* ---------- Notify parent of open state ---------- */
  useEffect(() => {
    if (typeof onOpenChange === "function") {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  /* ---------- Close on ESC ---------- */
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () =>
      document.removeEventListener("keydown", handleEsc);
  }, [open]);

  /* ---------- Select currency ---------- */
  const selectCurrency = useCallback(
    (currency) => {
      if (!SUPPORTED_CURRENCIES.includes(currency)) return;
      onChange(currency);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex gap-1 items-center justify-center
          px-3 py-2 rounded-2xl
          bg-white/20 dark:bg-black/20
          backdrop-blur-xl
          border border-white/30 dark:border-white/10
          shadow-[0_8px_20px_rgba(0,0,0,0.25)]
          transition-all active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        "
      >
        <span aria-hidden>{getFlagEmoji(selected)}</span>
        <span className="font-medium">{selected}</span>
        <span
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"
            }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="
            absolute left-0 right-0 mt-2 z-[60]
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl
            max-h-64 overflow-y-auto
          "
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={selected === code}
              onClick={() => selectCurrency(code)}
              className={`
                w-full px-4 py-3 text-left text-sm
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${selected === code
                  ? "bg-gray-50 dark:bg-gray-800 font-medium"
                  : ""}
              `}
            >
              <span className="mr-2" aria-hidden>
                {getFlagEmoji(code)}
              </span>
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

CurrencySelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onOpenChange: PropTypes.func,
  disabled: PropTypes.bool,
};
