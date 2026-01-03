import React from "react";
import FrequencySelector from "../../FrequencySelector";

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
  t
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
