export function explainOverlap(
  { group, keep, cancel = [], potentialSavings, currency },
  t
) {
  if (!keep || !cancel.length || potentialSavings <= 0) return null;

  const cancelled = cancel.map(c => c.name).join(" & ");

  return t(
    "overlaps.ai_explanation_v2",
    "You are paying for multiple {{group}} services. {{cancelled}} overlaps with {{kept}}, but {{kept}} is the lowest-cost option. Keeping {{kept}} could reduce your monthly spending by {{amount}} {{currency}}."
  )
    .replace("{{cancelled}}", cancelled)
    .replaceAll("{{kept}}", keep.name)
    .replace("{{amount}}", potentialSavings.toFixed(2))
    .replace("{{currency}}", currency)
    .replace("{{group}}", group);
}
