import React from "react";
import PropTypes from "prop-types";
import FrequencySelector from "./FrequencySelector";

/**
 * FrequencyField
 * - Subscription frequency selector
 *
 * PURE UI COMPONENT
 */
export default function FrequencyField({
  frequency,
  setFrequency,
  isPremium,
  onRequirePremium,
  t,
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("form_frequency")}
      </label>

      <FrequencySelector
        value={frequency}
        onChange={setFrequency}
        isPremium={isPremium}
        onRequirePremium={onRequirePremium}
      />
    </div>
  );
}

/* ------------------------------------
   ✅ PropTypes
------------------------------------ */
FrequencyField.propTypes = {
  /** Current selected frequency (e.g., "monthly") */
  frequency: PropTypes.string.isRequired,

  /** Setter function for frequency */
  setFrequency: PropTypes.func.isRequired,

  /** Whether the current user has premium access */
  isPremium: PropTypes.bool.isRequired,

  /** Callback triggered when user tries to select premium-only frequency */
  onRequirePremium: PropTypes.func.isRequired,

  /** i18n translation function */
  t: PropTypes.func.isRequired,
};
