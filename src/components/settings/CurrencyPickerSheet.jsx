import React, { useEffect, useState, useMemo, useRef } from "react";
import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCurrency } from "../../context/CurrencyContext";
import { CURRENCY_LABELS } from "../../utils/currencyLabels";
import { useTranslation } from "react-i18next";

const ALL_CURRENCIES = Object.keys(CURRENCY_LABELS);
const CLOSE_THRESHOLD = 120;

export default function CurrencyPickerSheet({ onClose }) {
  const { currency, setCurrency } = useCurrency();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offsetY, setOffsetY] = useState(0);
  const startY = useRef(null);
  const { t } = useTranslation();

  // Debounce query for performance
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return ALL_CURRENCIES;
    const q = debouncedQuery.toLowerCase();
    return ALL_CURRENCIES.filter(
      c =>
        c.toLowerCase().includes(q) ||
        CURRENCY_LABELS[c].toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  // Close on escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function onPointerDown(e) { startY.current = e.clientY; }
  function onPointerMove(e) {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setOffsetY(delta);
  }
  function onPointerUp() {
    if (offsetY > CLOSE_THRESHOLD) {
      setOffsetY(window.innerHeight);
      setTimeout(onClose, 200);
    } else {
      setOffsetY(0);
    }
    startY.current = null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-picker-title"
      className="fixed inset-0 z-50 flex items-start"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full bg-white dark:bg-gray-900 rounded-t-[28px] shadow-2xl flex flex-col animate-sheet-in mt-2"
        style={{
          transform: `translateY(${offsetY}px)`,
          height: "calc(100dvh - env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="flex justify-center py-2 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <h2 id="currency-picker-title" className="text-lg font-semibold">
              {t("settings_currency_select")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings_currency_subtitle")}
            </p>
          </div>
          <button onClick={onClose} aria-label={t("close") || "Close"}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("search_curr") || "Search currencies"}
              placeholder={t("search_curr") || "Search currencies..."}
              className="bg-transparent w-full outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filtered.map((code) => {
            const active = code === currency;
            return (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-2 border transition ${active
                  ? "bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
              >
                <div className="flex gap-2">
                  <span className="text-sm font-medium">{code}</span>
                  <span className="text-sm text-gray-500">
                    {CURRENCY_LABELS[code]}
                  </span>
                </div>
                {active && <CheckIcon className="w-6 h-6 text-orange-600" />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-6">
              No currencies found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import PropTypes from "prop-types";

CurrencyPickerSheet.propTypes = {
  onClose: PropTypes.func.isRequired,
};
