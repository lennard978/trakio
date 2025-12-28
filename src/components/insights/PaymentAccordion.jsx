import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { convert as convertUtil } from "../../utils/currency";
import { getNormalizedPayments } from "../../utils/payments";
import { getCurrentMonthSpending } from "../../utils/budget";

export default function PaymentAccordion({ subscriptions = [], currency = "EUR", rates, convert }) {
  const { t } = useTranslation();

  // ✅ One state to track open/closed by subscription ID
  const [openMap, setOpenMap] = useState({});

  const toggle = (id) => {
    setOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
      {subscriptions.map((s) => {
        const payments = getNormalizedPayments(s, currency, rates, convert);
        const totalPaid = payments.reduce((sum, p) => {
          const converted = rates ? convertUtil(p.amount, p.currency, currency, rates) : p.amount;
          return sum + converted;
        }, 0);

        const isOpen = openMap[s.id];

        return (
          <div
            key={s.id}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1f2a]
            shadow-sm dark:shadow-inner dark:shadow-[#141824] transition-all"
          >
            <button
              onClick={() => toggle(s.id)}
              className="w-full flex justify-between items-center p-3 text-left rounded-t-xl
              hover:bg-orange-50 dark:hover:bg-[#ed7014]/10 transition-all duration-300"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t(`frequency_${s.frequency}`)} · {payments.length} {t("insights_payment_Payments")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {`${currency} ${totalPaid.toFixed(2)}`}
                </div>
                {isOpen ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    {payments.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-1"
                      >
                        <span>{new Date(p.date).toLocaleDateString()}</span>
                        <span>
                          {`${currency} ${(
                            rates ? convertUtil(p.amount, p.currency, currency, rates) : p.amount
                          ).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
