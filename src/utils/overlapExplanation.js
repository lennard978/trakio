/**
 * Generates a human-readable AI explanation for overlapping subscriptions.
 * Pure function: no React, no hooks, no side effects.
 */
export function explainOverlap(
  { group, keep, cancel = [], potentialSavings, currency },
  t
) {
  if (!keep || cancel.length === 0 || potentialSavings <= 0) return null;

  const cancelledNames = cancel.map(c => c.name).join(" & ");

  return t(
    "overlaps.ai_explanation",
    "You have multiple {{group}} services ({{cancelled}} and {{kept}}). Keeping {{kept}} instead could reduce your recurring costs by {{amount}} {{currency}} per month without losing access to this category."
  )
    .replace("{{group}}", group)
    .replace("{{cancelled}}", cancelledNames)
    .replaceAll("{{kept}}", keep.name)
    .replace("{{amount}}", potentialSavings.toFixed(2))
    .replace("{{currency}}", currency);
}
