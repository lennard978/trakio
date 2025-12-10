// src/components/CategorySelector.jsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { CATEGORY_STYLES } from "../utils/CategoryStyles";
import { useTranslation } from "react-i18next";

export default function CategorySelector({ value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /** -----------------------------------------------------------
   * Precompute categories once for performance
   * ----------------------------------------------------------- */
  const categories = useMemo(() => Object.keys(CATEGORY_STYLES), []);
  const selected = CATEGORY_STYLES[value] || CATEGORY_STYLES.other;

  /** -----------------------------------------------------------
   * Click outside to close
   * ----------------------------------------------------------- */
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /** -----------------------------------------------------------
   * Select a category
   * ----------------------------------------------------------- */
  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="form-field"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selected.icon}</span>
          <span>{t(selected.label)}</span>
        </span>

        <span className="form-arrow">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            max-h-64 overflow-y-auto
          "
        >
          {categories.map((key) => {
            const c = CATEGORY_STYLES[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className="
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition
                "
              >
                <span className="text-lg">{c.icon}</span>
                <span>{t(c.label)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
