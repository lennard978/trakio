import React, { useState, useMemo } from "react";
import { XMarkIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCurrency } from "../../context/CurrencyContext";
import { CURRENCY_LABELS } from "../../utils/currencyLabels";

const ALL_CURRENCIES = Object.keys(CURRENCY_LABELS);

export default function CurrencyPickerSheet({ onClose }) {
  const { currency, setCurrency } = useCurrency();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return ALL_CURRENCIES;
    const q = query.toLowerCase();
    return ALL_CURRENCIES.filter(
      (c) =>
        c.toLowerCase().includes(q) ||
        CURRENCY_LABELS[c].toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* sheet */}
      <div className="
        absolute top-0 left-0 right-0
        bg-white dark:bg-gray-900
        rounded-t-3xl
        max-h-[85vh]
        flex flex-col
        shadow-2xl
      ">
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-gray-100 dark:bg-gray-800">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currencies..."
              className="bg-transparent w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* list */}
        <div className="overflow-y-auto px-3 pb-6">
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
                    ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                <div className="flex gap-2 justify-center items">
                  <div className="text-sm">{code}</div>
                  <div className="text-sm  text-gray-500">
                    {CURRENCY_LABELS[code]}
                  </div>
                </div>

                {active && (
                  <CheckIcon className="w-6 h-6 text-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
