import { useEffect } from "react";

export default function useBudgetAlerts({
  forecast30,
  currency,
  isPremium,
}) {
  useEffect(() => {
    if (!isPremium) return;
    if (!forecast30) return;

    const budgetRaw = localStorage.getItem("monthly_budget");
    const enabled =
      localStorage.getItem("budget_alerts_enabled") === "1";

    if (!enabled) return;

    const budget = Number(budgetRaw);
    if (!budget || budget <= 0) return;

    if (forecast30.total <= budget) return;

    const monthKey = new Date()
      .toISOString()
      .slice(0, 7); // YYYY-MM

    const alertKey = `budget_alert_${monthKey}`;

    if (localStorage.getItem(alertKey)) return;

    alert(
      `⚠️ Budget exceeded\n\n` +
      `Next 30 days: ${currency} ${forecast30.total.toFixed(2)}\n` +
      `Budget: ${currency} ${budget.toFixed(2)}`
    );

    localStorage.setItem(alertKey, "shown");
  }, [forecast30, currency, isPremium]);
}
