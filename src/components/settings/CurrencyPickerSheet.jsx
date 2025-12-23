import React, { useEffect, useState, useMemo, useRef } from "react";
import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCurrency } from "../../context/CurrencyContext";
import { CURRENCY_LABELS } from "../../utils/currencyLabels";

const ALL_CURRENCIES = Object.keys(CURRENCY_LABELS);
const CLOSE_THRESHOLD = 120;

export default function CurrencyPickerSheet({ onClose }) {
  const { currency, setCurrency } = useCurrency();
  const [query, setQuery] = useState("");
  const [offsetY, setOffsetY] = useState(0);
  const startY = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return ALL_CURRENCIES;
    const q = query.toLowerCase();
    return ALL_CURRENCIES.filter(
      c =>
        c.toLowerCase().includes(q) ||
        CURRENCY_LABELS[c].toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function onPointerDown(e) {
    startY.current = e.clientY;
  }

  function onPointerMove(e) {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setOffsetY(delta);
  }

  function onPointerUp() {
    if (offsetY > CLOSE_THRESHOLD) {
      onClose();
    } else {
      setOffsetY(0);
    }
    startY.current = null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* sheet */}
      <div
        className="
  relative w-full
  bg-white dark:bg-gray-900
  rounded-t-[28px]
  shadow-2xl
  flex flex-col
  animate-sheet-in
  mt-2
"

        style={{
          transform: `translateY(${offsetY}px)`,
          height: "calc(100dvh - env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Select Base Currency</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your base currency
            </p>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl
            bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currencies..."
              className="bg-transparent w-full outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* list */}
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
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3 rounded-2xl mb-2
                  border transition
                  ${active
                    ? "bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }
                `}
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
        </div>
      </div>
    </div>
  );
}
