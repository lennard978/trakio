export function getAnnualCost(subscriptions = []) {
  return subscriptions.reduce((sum, s) => {
    const price = Number(s.price || 0);
    if (!price || !s.frequency) return sum;

    switch (s.frequency) {
      case "weekly":
        return sum + price * 52;
      case "biweekly":
        return sum + price * 26;
      case "monthly":
        return sum + price * 12;
      case "quarterly":
        return sum + price * 4;
      case "yearly":
        return sum + price;
      default:
        return sum;
    }
  }, 0);
}
