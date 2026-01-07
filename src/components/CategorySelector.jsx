import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { CATEGORY_STYLES } from "../utils/CategoryStyles";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

export default function CategorySelector({ value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Focus management for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const ref = useRef(null);
  const buttonRef = useRef(null);

  /** -----------------------------------------------------------
   * Precompute categories once
   * ----------------------------------------------------------- */
  const categories = useMemo(() => Object.keys(CATEGORY_STYLES), []);
  const resolvedValue = CATEGORY_STYLES[value] ? value : "other";
  const selected = CATEGORY_STYLES[resolvedValue] || CATEGORY_STYLES.other;

  const selectedIndex = useMemo(() => {
    const idx = categories.indexOf(resolvedValue);
    return idx >= 0 ? idx : 0;
  }, [categories, resolvedValue]);

  /** -----------------------------------------------------------
   * Close dropdown on outside click or Escape
   * ----------------------------------------------------------- */
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /** -----------------------------------------------------------
   * When opening, focus the selected option
   * ----------------------------------------------------------- */
  useEffect(() => {
    if (!open) {
      setFocusedIndex(-1);
      return;
    }
    setFocusedIndex(selectedIndex);
  }, [open, selectedIndex]);

  /** -----------------------------------------------------------
   * Select a category
   * ----------------------------------------------------------- */
  const handleSelect = useCallback(
    (key) => {
      if (typeof key !== "string") return;
      onChange(key);
      setOpen(false);
      // return focus to button for accessibility
      buttonRef.current?.focus?.();
    },
    [onChange]
  );

  /** -----------------------------------------------------------
   * Keyboard support (button + listbox)
   * ----------------------------------------------------------- */
  const clampIndex = (idx) => {
    if (!categories.length) return 0;
    if (idx < 0) return categories.length - 1;
    if (idx >= categories.length) return 0;
    return idx;
  };

  const handleButtonKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    // Open and set focus when using arrows
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleListKeyDown = (e) => {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus?.();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => clampIndex((prev < 0 ? selectedIndex : prev) + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => clampIndex((prev < 0 ? selectedIndex : prev) - 1));
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(categories.length - 1);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const key = categories[focusedIndex >= 0 ? focusedIndex : selectedIndex];
      handleSelect(key);
    }
  };

  /** -----------------------------------------------------------
   * Render
   * ----------------------------------------------------------- */
  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <button
        ref={buttonRef}
        id="category-selector-button"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="category-selector-list"
        aria-label={t(selected.label)}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className="flex justify-between items-center w-full px-4 py-3 rounded-xl border text-sm
                   bg-white dark:bg-gray-900
                   border-gray-300 dark:border-gray-700
                   hover:border-orange-500
                   focus:ring-2 focus:ring-orange-400
                   transition-all duration-150"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {selected.icon}
          </span>
          <span className="capitalize">{t(selected.label)}</span>
        </span>
        <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="category-selector-list"
            role="listbox"
            aria-labelledby="category-selector-button"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl z-40
                       bg-white dark:bg-gray-900
                       border border-gray-200 dark:border-gray-700
                       max-h-64 overflow-y-auto backdrop-blur-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {categories.map((key, idx) => {
              const c = CATEGORY_STYLES[key];
              const isActive = key === resolvedValue;
              const isFocused = idx === focusedIndex;

              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(key)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`w-full flex items-center justify-start gap-3 px-4 py-3 text-left text-sm capitalize
                    transition-colors duration-150
                    focus:outline-none
                    ${isActive
                      ? "bg-orange-50 dark:bg-orange-900/40 font-medium text-orange-700 dark:text-orange-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }
                    ${isFocused ? "ring-2 ring-orange-400/40" : ""}
                  `}
                >
                  <span className="text-lg" aria-hidden="true">
                    {c.icon}
                  </span>
                  <span>{t(c.label)}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

CategorySelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
