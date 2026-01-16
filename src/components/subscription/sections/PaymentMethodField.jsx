import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PaymentMethodField
 * - Animated, accessible, and polished dropdown
 * - Supports Escape to close + hover glow
 *
 * PURE UI COMPONENT
 */
export default function PaymentMethodField({
  setMethod,
  methods,
  selectedMethod = null,
  methodOpen,
  setMethodOpen,
  t,
}) {
  const methodRef = useRef(null);

  /** -------------------------------------------
   * Close dropdown when clicking outside / Escape
   * ------------------------------------------ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (methodRef.current && !methodRef.current.contains(e.target)) {
        setMethodOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setMethodOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [setMethodOpen]);

  /** -------------------------------------------
   * Handle selecting a payment method
   * ------------------------------------------ */
  const handleSelect = useCallback(
    (m) => {
      setMethod(m.value);
      setMethodOpen(false);
    },
    [setMethod, setMethodOpen]
  );

  /** -------------------------------------------
   * Defensive fallback (prevents crashes)
   * ------------------------------------------ */
  const safeSelectedMethod =
    selectedMethod || methods[0] || {
      value: "",
      label: "pay_method",
      icon: "💳",
      logo: null,
    };

  return (
    <div ref={methodRef} className="relative">
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("pay_method")}
      </label>

      {/* Button */}
      <button
        type="button"
        onClick={() => setMethodOpen((prev) => !prev)}
        className="form-field flex justify-between items-center cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={methodOpen}
      >
        <span className="flex items-center gap-2">
          {safeSelectedMethod.logo ? (
            <img
              src={safeSelectedMethod.logo}
              alt={t(safeSelectedMethod.label)}
              className="w-5 h-5 object-contain drop-shadow-sm"
            />
          ) : (
            <span className="text-lg">{safeSelectedMethod.icon}</span>
          )}
          <span>{t(safeSelectedMethod.label)}</span>
        </span>

        {/* Arrow with rotation */}
        <motion.span
          animate={{ rotate: methodOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="form-arrow text-gray-500"
        >
          ▾
        </motion.span>
      </button>

      {/* Animated Dropdown */}
      <AnimatePresence>
        {methodOpen && (
          <motion.div
            role="listbox"
            aria-label={t("pay_method")}
            tabIndex={-1}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="
              absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              max-h-64 overflow-y-auto backdrop-blur-md
            "
          >
            {methods.map((m) => {
              const isSelected = m.value === safeSelectedMethod.value;

              return (
                <motion.button
                  key={m.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(m)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-all duration-150 relative
                    focus:outline-none focus:ring-2 focus:ring-orange-500/40
                    ${isSelected ? "bg-gray-100 dark:bg-gray-800" : ""}
                  `}
                >
                  {m.logo ? (
                    <motion.img
                      src={m.logo}
                      alt={t(m.label)}
                      className="w-5 h-5 object-contain drop-shadow-sm"
                      whileHover={{
                        scale: 1.15,
                        filter:
                          "drop-shadow(0 0 6px rgba(249,115,22,0.6))",
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <motion.span
                      className="text-lg"
                      whileHover={{
                        scale: 1.15,
                        textShadow:
                          "0px 0px 6px rgba(249,115,22,0.7)",
                      }}
                    >
                      {m.icon}
                    </motion.span>
                  )}

                  <span className="text-sm">{t(m.label)}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------
   ✅ PropTypes
------------------------------------ */
PaymentMethodField.propTypes = {
  setMethod: PropTypes.func.isRequired,
  methods: PropTypes.array.isRequired,
  selectedMethod: PropTypes.object,
  methodOpen: PropTypes.bool.isRequired,
  setMethodOpen: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};
