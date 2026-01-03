import React, { useRef, useEffect } from "react";

/**
 * PaymentMethodField
 * - Payment method dropdown
 *
 * PURE UI COMPONENT
 */
export default function PaymentMethodField({
  method,
  setMethod,
  methods,
  selectedMethod,
  methodOpen,
  setMethodOpen,
  t
}) {
  const methodRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (methodRef.current && !methodRef.current.contains(e.target)) {
        setMethodOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setMethodOpen]);

  return (
    <div ref={methodRef} className="relative">
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("pay_method")}
      </label>

      {/* Button */}
      <button
        type="button"
        onClick={() => setMethodOpen((p) => !p)}
        className="form-field"
      >
        <span className="flex items-center gap-2">
          {selectedMethod.logo ? (
            <img
              src={selectedMethod.logo}
              alt=""
              className="w-5 h-5 object-contain"
            />
          ) : (
            <span className="text-lg">{selectedMethod.icon}</span>
          )}
          <span>{selectedMethod.label}</span>
        </span>

        <span className="form-arrow">▾</span>
      </button>

      {/* Dropdown */}
      {methodOpen && (
        <div
          className="
            absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            max-h-64 overflow-y-auto
          "
        >
          {methods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setMethod(m.value);
                setMethodOpen(false);
              }}
              className="
                w-full flex items-center gap-3 px-4 py-3 text-left
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition
              "
            >
              {m.logo ? (
                <img
                  src={m.logo}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className="text-lg">{m.icon}</span>
              )}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
