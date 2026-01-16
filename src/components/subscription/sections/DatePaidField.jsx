import React from "react";
import PropTypes from "prop-types";

/**
 * DatePaidField
 * - Last paid date selector
 *
 * PURE UI COMPONENT
 */
export default function DatePaidField({ datePaid = "", setDatePaid, t }) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <label
        htmlFor="date-paid"
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t("label_select_paid_date")}
      </label>

      <input
        id="date-paid"
        type="date"
        value={datePaid || ""}
        max={today}
        onChange={(e) => setDatePaid(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
      />
    </div>
  );
}

DatePaidField.propTypes = {
  datePaid: PropTypes.string,
  setDatePaid: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

