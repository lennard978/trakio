import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { LockClosedIcon } from "@heroicons/react/24/outline"; // ✅ heroicons lock icon
import PropTypes from "prop-types";

const OPTIONS = [
  { value: "weekly", labelKey: "frequency_weekly", premiumOnly: false },
  { value: "biweekly", labelKey: "frequency_biweekly", premiumOnly: false },
  { value: "monthly", labelKey: "frequency_monthly", premiumOnly: false },
  { value: "quarterly", labelKey: "frequency_quarterly", premiumOnly: true },
  { value: "semiannual", labelKey: "frequency_semiannual", premiumOnly: true },
  { value: "nine_months", labelKey: "frequency_nine_months", premiumOnly: true },
  { value: "yearly", labelKey: "frequency_yearly", premiumOnly: false },
  { value: "biennial", labelKey: "frequency_biennial", premiumOnly: true },
  { value: "triennial", labelKey: "frequency_triennial", premiumOnly: true },
];

export default function FrequencySelector({ value, onChange, isPremium, onRequirePremium }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const ref = useRef(null);

  const selectedOption = useMemo(
    () => OPTIONS.find((opt) => opt.value === value) || OPTIONS.find((o) => o.value === "monthly"),
    [value]
  );

  /** Close dropdown on outside click / ESC */
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSelect = useCallback(
    (opt) => {
      if (opt.premiumOnly && !isPremium) {
        onRequirePremium?.();
        return;
      }
      onChange(opt.value);
      setOpen(false);
    },
    [isPremium, onChange, onRequirePremium]
  );

  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="form-field cursor-pointer flex justify-between items-center"
      >
        <span className="text-sm font-medium">{t(selectedOption.labelKey)}</span>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="form-arrow text-gray-500"
        >
          ▾
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 mt-2 z-40 
                       bg-white dark:bg-gray-900 
                       border border-gray-200 dark:border-gray-700 
                       rounded-xl shadow-xl overflow-hidden"
          >
            {OPTIONS.map((opt) => {
              const locked = opt.premiumOnly && !isPremium;

              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() =>
                    locked &&
                    setTooltip({
                      text: t("premium_required_message") || "Upgrade to unlock custom intervals",
                      value: opt.value,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between
                              transition-all duration-150
                              hover:bg-gray-100 dark:hover:bg-gray-800
                              ${opt.value === value ? "bg-orange-50 dark:bg-orange-900/30 font-semibold" : ""}
                              ${locked ? "opacity-70 cursor-pointer" : ""}
                            `}
                >
                  <span className="flex items-center gap-2">
                    {t(opt.labelKey)}
                    {locked && (
                      <LockClosedIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                    )}
                  </span>

                  {opt.premiumOnly && !isPremium && (
                    <motion.span
                      className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/80 text-black font-semibold"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      PRO
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.value}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 px-3 py-1.5 text-xs rounded-lg 
                       bg-black/80 text-white backdrop-blur-sm 
                       shadow-lg z-50"
          >
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
/* ------------------------------------
   ✅ PropTypes
------------------------------------ */
FrequencySelector.propTypes = {
  /** Current frequency value (e.g. "monthly") */
  value: PropTypes.string.isRequired,

  /** Function to update frequency value */
  onChange: PropTypes.func.isRequired,

  /** Whether the current user is premium */
  isPremium: PropTypes.bool,

  /** Optional callback when a premium-only option is tapped */
  onRequirePremium: PropTypes.func,
};
