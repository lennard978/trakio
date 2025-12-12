export function detectPriceIncrease({
  previousPrice,
  newPrice,
  thresholdPercent = 10,
}) {
  if (
    typeof previousPrice !== "number" ||
    typeof newPrice !== "number"
  ) {
    return null;
  }

  if (newPrice <= previousPrice) return null;

  const diff = newPrice - previousPrice;
  const percent = Math.round((diff / previousPrice) * 100);

  if (percent < thresholdPercent) return null;

  return {
    oldPrice: previousPrice,
    newPrice,
    percent,
  };
}
