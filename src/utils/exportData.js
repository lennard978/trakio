import { exportPaymentHistoryCSV } from "./exportCSV";

export function exportSubscriptionsCSV(subscriptions) {
  const rows = [
    ["name", "price", "currency", "frequency", "category", "method"]
  ];

  subscriptions.forEach((s) => {
    rows.push([
      s.name,
      s.price,
      s.currency || "EUR",
      s.frequency,
      s.category,
      s.method || ""
    ]);
  });

  downloadCSV(rows, "subscriptions.csv");
}

export function exportAnnualSummaryCSV(subscriptions) {
  const rows = [["name", "annual_cost", "currency"]];

  subscriptions.forEach((s) => {
    const annual =
      s.frequency === "monthly" ? s.price * 12 :
        s.frequency === "yearly" ? s.price :
          s.price;

    rows.push([
      s.name,
      annual.toFixed(2),
      s.currency || "EUR"
    ]);
  });

  downloadCSV(rows, "annual-summary.csv");
}

export function exportFullJSON({ user, subscriptions, settings }) {
  const payload = {
    exportedAt: new Date().toISOString(),
    user: { email: user?.email ?? null },
    settings,
    subscriptions,
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trakio-full-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* helper */
function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
