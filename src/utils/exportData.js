import { getNormalizedPayments } from "./payments";

export function exportSubscriptionsCSV(subscriptions) {
  const rows = [
    ["name", "frequency", "category", "method", "currency", "amount", "paymentDate", "color"]
  ];

  subscriptions.forEach((s) => {
    const payments = getNormalizedPayments(s); // ✅ Use normalized & deduplicated payments

    payments.forEach((p) => {

      rows.push([
        s.name,
        s.frequency || "monthly",
        s.category || "Uncategorized",
        s.method || "Unknown",
        p.currency || s.currency || "EUR",
        p.amount?.toFixed(2) ?? "0.00",
        p.date || "",
        s.color || ""
      ]);
    });
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

  const csv = rows.map(row =>
    row.map(field => {
      if (typeof field === "string") {
        const escaped = field.replace(/"/g, '""');
        if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")) {
          return `"${escaped}"`;
        }
        return escaped;
      }
      return field;
    }).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


