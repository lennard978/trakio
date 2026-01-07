export default function calculateAnnualCost(subscriptions, currency, rates, convert) {
  return subscriptions.reduce((sum, sub) => {
    const price = Number(sub.price || 0);
    if (!price || !sub.frequency) return sum;

    const converted = convert(price, sub.currency, currency, rates);

    switch (sub.frequency) {
      case "weekly": return sum + converted * 52;
      case "biweekly": return sum + converted * 26;
      case "monthly": return sum + converted * 12;
      case "quarterly": return sum + converted * 4;
      case "yearly": return sum + converted;
      default: return sum;
    }
  }, 0);
}
