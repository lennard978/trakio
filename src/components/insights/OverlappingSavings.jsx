import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { resolveProviderLink } from "../../utils/providerLinks";
import { useTranslation } from "react-i18next";
import { explainOverlap } from "../../utils/overlapExplanation";

/**
 * Props:
 * - overlaps: array from /api/overlaps
 * - hasPremiumAccess: boolean
 * - onSaveNow: ({ provider, message }) => void
 */
export default function OverlappingSavings({
  overlaps = [],
  hasPremiumAccess,
  onSaveNow,
}) {
  const { t } = useTranslation();

  if (!overlaps.length) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("overlaps.none", "No overlapping services detected.")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {overlaps.map((group) => {
        // 🔹 Pick most expensive subscription to cancel
        const cancelTarget =
          group.cancel
            ?.slice()
            .sort((a, b) => (b.price || 0) - (a.price || 0))[0] || null;

        // 🔹 Avoided next renewal charge
        const avoidedNextCharge = cancelTarget?.price || 0;

        // 🔹 Days until next billing
        const daysUntilNextCharge = cancelTarget?.nextBillingDate
          ? Math.max(
            0,
            Math.ceil(
              (new Date(cancelTarget.nextBillingDate) - new Date()) /
              (1000 * 60 * 60 * 24)
            )
          )
          : null;

        const provider = cancelTarget
          ? resolveProviderLink(cancelTarget.name)
          : null;

        return (
          <div
            key={group.group}
            className="rounded-lg border border-gray-300 dark:border-gray-800/70 
                       bg-white dark:bg-[#0e1420] p-3"
          >
            {/* Group name */}
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {group.group}
            </div>

            {/* Compared services */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {group.items.map((i) => i.name).join(" vs ")}
            </div>

            {/* Recommended tooltip */}
            {group.keep && (
              <span
                title={t(
                  "overlaps.recommended_tooltip",
                  "This is the cheapest option in this category."
                )}
                className="inline-flex items-center cursor-help text-gray-400 hover:text-gray-300 mt-1"
              >
                <InformationCircleIcon className="w-4 h-4" />
              </span>
            )}

            {/* Savings */}
            {group.potentialSavings > 0 && (
              <div className="mt-2 space-y-1">

                {/* Monthly savings */}
                <div className="text-sm font-medium text-green-600">
                  {t(
                    "overlaps.savings_monthly",
                    "You could save {{amount}} / month"
                  ).replace(
                    "{{amount}}",
                    `${group.potentialSavings.toFixed(2)} ${group.currency}`
                  )}
                </div>

                {/* Annual savings */}
                <div className="text-xs text-green-700 dark:text-green-500">
                  {t(
                    "overlaps.savings_annual",
                    "{{amount}} / year"
                  ).replace(
                    "{{amount}}",
                    `${(group.potentialSavings * 12).toFixed(2)} ${group.currency}`
                  )}
                </div>

                {/* Avoided next charge */}
                {cancelTarget && avoidedNextCharge > 0 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {t(
                      "overlaps.avoided_next_charge",
                      "≈ {{amount}} {{currency}} will be avoided at the next renewal{{days}}"
                    )
                      .replace("{{amount}}", avoidedNextCharge.toFixed(2))
                      .replace("{{currency}}", cancelTarget.currency || "EUR")
                      .replace(
                        "{{days}}",
                        daysUntilNextCharge !== null
                          ? ` (${t("common.in_days", "in {{d}} days")
                            .replace("{{d}}", daysUntilNextCharge)})`
                          : ""
                      )}
                  </div>
                )}

                {/* AI explanation */}
                {(() => {
                  const explanation = explainOverlap(
                    {
                      group: group.group,
                      keep: group.keep,
                      cancel: group.cancel,
                      potentialSavings: group.potentialSavings,
                      currency: group.currency
                    },
                    t
                  );

                  return explanation ? (
                    <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                      {explanation}
                    </div>
                  ) : null;
                })()}
              </div>
            )}



            {/* Save now */}
            {hasPremiumAccess && cancelTarget && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    onSaveNow({
                      provider,
                      message: provider
                        ? t(
                          "overlaps.save_now_with_avoidance",
                          "Cancel {{service}} before the next renewal to avoid a {{amount}} {{currency}} charge."
                        )
                          .replace("{{service}}", cancelTarget.name)
                          .replace(
                            "{{amount}}",
                            avoidedNextCharge.toFixed(2)
                          )
                          .replace(
                            "{{currency}}",
                            cancelTarget.currency || "EUR"
                          )
                        : t(
                          "overlaps.save_now_hint",
                          "Cancel the more expensive subscription in the provider’s app or website."
                        ),
                    })
                  }
                  className="text-xs px-3 py-1 rounded-full 
                             border border-[#ED7014] text-[#ED7014]
                             hover:bg-[#ED7014] hover:text-white transition"
                >
                  {t("overlaps.save_now", "Save now")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
